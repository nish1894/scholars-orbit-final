import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';
import ChatHistory from '../models/ChatHistory.js';
import SuggestedQuestion from '../models/SuggestedQuestion.js';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MAX_HISTORY_PAIRS = 5;
const MAX_MSG_CHARS = 500;

// Extracts userId if token present; does not block unauthenticated requests
const optionalAuth = (req, _res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
      req.userId = decoded.id;
    } catch { /* invalid token — proceed without auth */ }
  }
  next();
};

const trimText = (text) =>
  text && text.length > MAX_MSG_CHARS ? text.slice(0, MAX_MSG_CHARS) + '...' : text;

const VALID_SUBJECTS = ['Math', 'Physics', 'Chemistry', 'Biology', 'Exam Prep', 'Other'];

const classifySubject = async (message) => {
  try {
    const classifier = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await classifier.generateContent(
      `Classify this student question into exactly one category. Reply with ONLY the category name, nothing else.\nCategories: Math, Physics, Chemistry, Biology, Exam Prep, Other\nQuestion: ${message.slice(0, 200)}`
    );
    const raw = result.response.text().trim();
    return VALID_SUBJECTS.find((s) => raw.includes(s)) || 'Other';
  } catch {
    return 'Other';
  }
};

const BASE_RULES = `
- Never use bold/markdown formatting (no **, no ##, no ###)
- Never use decorative emojis
- Use plain text section headings on their own line
- Use line spacing between sections
- Use simple inline equation formatting (e.g. F = ma, E = mc^2)
- Keep formatting minimal and professional
- Skip filler phrases like "Okay, let's break this down" or "Key takeaway"`;

const MODE_PROMPTS = {
  scholar: `You are a Science (PCM - Physics, Chemistry, Mathematics) study assistant for JEE and NEET preparation.

Response rules:
- Give detailed, structured, academic-tone explanations
- Break concepts into clear sections with plain text headings
- Include derivations, proofs, or step-by-step reasoning where relevant
- Define key terms precisely
- Reference underlying principles and connect related concepts
- Include practical examples wherever helpful
- Use bullet points for lists, short paragraphs for explanations
${BASE_RULES}`,

  mentor: `You are a Science (PCM - Physics, Chemistry, Mathematics) mentor for JEE and NEET preparation.

Response rules:
- Do NOT give the answer directly
- Ask 2-3 guiding questions that lead the student toward the answer
- Give small hints if the concept is hard, but let the student think
- If the student is stuck, provide one more hint before revealing the answer
- Encourage reasoning over memorization
- Use a warm but focused tone
${BASE_RULES}`,

  revision: `You are a Science (PCM - Physics, Chemistry, Mathematics) revision assistant for JEE and NEET preparation.

Response rules:
- Give a concise bullet-point summary of the topic (max 8-10 points)
- List all key formulas with variable definitions
- Highlight common exam mistakes or tricky points
- Add 1-2 memory tips if applicable
- Keep the entire response short and scannable
- Prioritize what is most likely to appear in exams
${BASE_RULES}`,

  practice: `You are a Science (PCM - Physics, Chemistry, Mathematics) quiz generator for JEE and NEET preparation.

Response rules:
- Generate exactly 5 multiple-choice questions (MCQs) on the topic
- Each question must have 4 options labeled A, B, C, D
- After all 5 questions, provide an Answer Key section with correct answers and a one-line explanation for each
- Questions should range from easy to moderate difficulty
- Cover different sub-aspects of the topic
- Use numerical problems where applicable
${BASE_RULES}`,
};

const LEVEL_MODIFIERS = {
  beginner: `
Explanation level: Beginner
- Use simple everyday analogies and relatable examples
- Avoid jargon; if a technical term is necessary, define it immediately in plain language
- Keep sentences short and easy to follow
- Assume the student is encountering this topic for the first time`,

  intermediate: `
Explanation level: Intermediate
- Give structured explanations with proper terminology
- Assume the student knows basic concepts and build on them
- Include relevant formulas with brief context on when to use them
- Balance clarity with depth`,

  advanced: `
Explanation level: Advanced
- Use precise technical language and formal academic tone
- Include rigorous derivations, edge cases, and exceptions
- Reference related theorems, laws, or advanced connections
- Assume strong foundational knowledge; skip basic definitions`,
};

// POST /api/chat/message
router.post('/message', optionalAuth, async (req, res) => {
  try {
    const { message, mode, level, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const modePrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.scholar;
    const levelModifier = LEVEL_MODIFIERS[level] || LEVEL_MODIFIERS.intermediate;
    const systemPrompt = modePrompt + '\n' + levelModifier;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    // Build chat history from MongoDB if user is authenticated
    let history = [];
    let conversation = null;

    if (req.userId && conversationId) {
      conversation = await ChatHistory.findOne({
        _id: conversationId,
        userId: req.userId,
      });

      if (conversation) {
        const recent = conversation.messages.slice(-(MAX_HISTORY_PAIRS * 2));
        history = recent.map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: trimText(msg.content) }],
        }));
      }
    }

    // Run main response + classification in parallel
    const chat = model.startChat({ history });
    const [chatResult, subject] = await Promise.all([
      chat.sendMessage(message),
      req.userId ? classifySubject(message) : Promise.resolve(null),
    ]);
    const reply = chatResult.response.text();

    // Persist exchange if authenticated
    let savedConversationId = conversationId || null;

    if (req.userId) {
      const userMsg = { role: 'user', content: message, subject };
      const assistantMsg = { role: 'assistant', content: reply };

      if (conversation) {
        conversation.messages.push(userMsg, assistantMsg);
        if (conversation.messages.length > 50) {
          conversation.messages = conversation.messages.slice(-50);
        }
        await conversation.save();
      } else {
        const title = message.slice(0, 50) + (message.length > 50 ? '...' : '');
        const created = await ChatHistory.create({
          userId: req.userId,
          title,
          messages: [userMsg, assistantMsg],
        });
        savedConversationId = created._id.toString();
      }
    }

    // Upsert into universal question pool (fire-and-forget)
    if (subject && subject !== 'Other' && message.length >= 15) {
      const normalized = message.trim().slice(0, 200);
      SuggestedQuestion.findOneAndUpdate(
        { text: normalized },
        { $inc: { globalCount: 1 }, $setOnInsert: { subject } },
        { upsert: true }
      ).catch(() => {});
    }

    res.json({ reply, conversationId: savedConversationId, subject });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

export default router;