import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import auth from '../middleware/auth.js';
import Note from '../models/Note.js';

const router = Router();

// All routes require authentication
router.use(auth);

// GET /api/notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ notes });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/notes
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content, subject } = req.body;
      const note = await Note.create({ title, content, subject, user: req.userId });
      res.status(201).json({ note });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/notes/:id
router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
    body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const note = await Note.findOne({ _id: req.params.id, user: req.userId });
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }

      const { title, content, subject } = req.body;
      if (title !== undefined) note.title = title;
      if (content !== undefined) note.content = content;
      if (subject !== undefined) note.subject = subject;
      await note.save();

      res.json({ note });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
