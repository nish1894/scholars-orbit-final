import { Router } from 'express';
import auth from '../middleware/auth.js';
import DirectMessage from '../models/DirectMessage.js';
import ChatRoom from '../models/ChatRoom.js';
import User from '../models/User.js';

const router = Router();

// GET /api/dm/users — list all users except self (for DM sidebar)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.userId } },
      'name email userType'
    )
      .sort({ name: 1 })
      .limit(100)
      .lean();

    res.json({ users });
  } catch (err) {
    console.error('DM users error:', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// GET /api/dm/messages/:roomId?before=<timestamp>&limit=30
router.get('/messages/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;

    // Verify the requesting user is a participant
    const room = await ChatRoom.findOne({ roomId, participants: req.userId });
    if (!room) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    const limit = Math.min(parseInt(req.query.limit) || 30, 50);
    const query = { roomId };

    // Cursor-based pagination: load messages older than `before`
    if (req.query.before) {
      query.createdAt = { $lt: new Date(req.query.before) };
    }

    const messages = await DirectMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Return in chronological order
    res.json({ messages: messages.reverse() });
  } catch (err) {
    console.error('DM messages error:', err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// GET /api/dm/conversations — list rooms the user participates in, with last message
router.get('/conversations', auth, async (req, res) => {
  try {
    const rooms = await ChatRoom.find({ participants: req.userId })
      .populate('participants', 'name email')
      .lean();

    // Attach last message to each room
    const result = await Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await DirectMessage.findOne({ roomId: room.roomId })
          .sort({ createdAt: -1 })
          .lean();
        return { ...room, lastMessage };
      })
    );

    // Sort by most recent message
    result.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.createdAt;
      const bTime = b.lastMessage?.createdAt || b.createdAt;
      return new Date(bTime) - new Date(aTime);
    });

    res.json({ conversations: result });
  } catch (err) {
    console.error('DM conversations error:', err);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

export default router;
