import { Router } from 'express';
import { query } from '../../db';
import { authenticate, AuthRequest } from '../../middleware/auth';

const router = Router();

// Save a house
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { listingId } = req.body;
    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID required' });
    }

    await query(
      'INSERT INTO saved_houses (student_id, listing_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user!.id, listingId]
    );

    res.status(201).json({ message: 'House saved' });
  } catch (error) {
    console.error('Save house error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unsave a house
router.delete('/:listingId', authenticate, async (req: AuthRequest, res) => {
  try {
    await query(
      'DELETE FROM saved_houses WHERE student_id = $1 AND listing_id = $2',
      [req.user!.id, req.params.listingId]
    );
    res.json({ message: 'House removed from saved' });
  } catch (error) {
    console.error('Unsave house error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List saved houses
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT l.*, sh.created_at as saved_at
      FROM saved_houses sh
      JOIN listings l ON sh.listing_id = l.id
      WHERE sh.student_id = $1
      ORDER BY sh.created_at DESC`,
      [req.user!.id]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('List saved error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
