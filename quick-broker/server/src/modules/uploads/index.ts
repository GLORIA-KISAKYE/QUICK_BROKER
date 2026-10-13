import { Router } from 'express';
import { query } from '../../db';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { uploadPhoto } from '../../utils/storage';

const router = Router();

// Upload a photo (base64 or binary)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { key, body, contentType } = req.body;
    if (!key || !body) {
      return res.status(400).json({ error: 'Photo key and body required' });
    }

    const url = await uploadPhoto(key, Buffer.from(body, 'base64'), contentType || 'image/jpeg');

    res.json({ url });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Serve local uploads (fallback when R2 is not configured)
router.get('/uploads/:filename', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'uploads', req.params.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

export default router;
