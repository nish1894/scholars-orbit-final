import { Router } from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import ChatHistory from '../models/ChatHistory.js';

const router = Router();

// GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/top-topics
router.get('/top-topics', auth, async (req, res) => {
  try {
    const topics = await ChatHistory.aggregate([
      { $match: { userId: req.userId } },
      { $unwind: '$messages' },
      { $match: { 'messages.role': 'user', 'messages.subject': { $exists: true, $ne: null } } },
      { $group: { _id: '$messages.subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $project: { _id: 0, topic: '$_id', count: 1 } },
    ]);
    res.json({ topics });
  } catch (error) {
    console.error('Top topics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
