import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a Science (PCM - Physics, Chemistry, Mathematics) study assistant for JEE and NEET preparation.

Response rules:
- Give compact, precise, structured explanations
- Use short clear sentences and bullet points over long paragraphs
- Include practical examples wherever helpful
- Define key terms briefly
- Never use bold/markdown formatting (no **, no ##, no ###)
- Never use decorative emojis
- Use plain text section headings on their own line
- Use line spacing between sections
- Use simple inline equation formatting (e.g. F = ma, E = mc^2)
- Keep formatting minimal and professional
- Prioritize clarity over length
- Skip filler phrases like "Okay, let's break this down" or "Key takeaway"
- Only give deep explanations if the user explicitly asks`;

// POST /api/chat/message
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });
    const result = await model.generateContent(message);
    const response = await result.response;

    res.json({ reply: response.text() });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

export default router;