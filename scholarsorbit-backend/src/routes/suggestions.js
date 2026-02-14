import { Router } from 'express';
import SuggestedQuestion from '../models/SuggestedQuestion.js';

const router = Router();

// GET /api/suggestions?subject=Physics&exclude=id1,id2
router.get('/', async (req, res) => {
  try {
    const { subject, exclude } = req.query;

    const query = {};
    if (subject && subject !== 'Other') {
      query.subject = subject;
    }
    if (exclude) {
      const ids = exclude.split(',').filter(Boolean);
      if (ids.length) query._id = { $nin: ids };
    }

    const suggestions = await SuggestedQuestion.find(query)
      .sort({ globalCount: -1 })
      .limit(5)
      .select('text subject globalCount')
      .lean();

    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// POST /api/suggestions/click — increment globalCount
router.post('/click', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id is required' });

    await SuggestedQuestion.findByIdAndUpdate(id, { $inc: { globalCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    console.error('Suggestion click error:', error);
    res.status(500).json({ error: 'Failed to record click' });
  }
});

export default router;
