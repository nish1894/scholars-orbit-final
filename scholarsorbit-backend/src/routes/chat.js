import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(message);
    const response = await result.response;

    res.json({ reply: response.text() });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

export default router;