import { Router } from 'express';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

let cachedData = null;

// GET /api/resources
router.get('/', async (_req, res) => {
  try {
    if (!cachedData) {
      const filePath = join(__dirname, '..', 'scripts', 'resource.json');
      const raw = await readFile(filePath, 'utf-8');
      cachedData = JSON.parse(raw);
    }
    res.json(cachedData);
  } catch (error) {
    console.error('Resources error:', error);
    res.status(500).json({ error: 'Failed to load resources' });
  }
});

export default router;
