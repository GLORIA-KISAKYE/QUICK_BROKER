import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../db';
import { authenticate, requireAdmin, AuthRequest } from '../../middleware/auth';

const router = Router();

const createReviewSchema = z.object({
  listingId: z.string().uuid(),
  inspectionId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  accuracyRating: z.number().min(1).max(5).optional(),
  waterRating: z.number().min(1).max(5).optional(),
  electricityRating: z.number().min(1).max(5).optional(),
  locationRating: z.number().min(1).max(5).optional(),
  comment: z.string().optional()
});

// Get reviews for a listing
router.get('/listing/:listingId', async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, p.name as student_name
      FROM reviews r
      JOIN profiles p ON r.student_id = p.id
      WHERE r.listing_id = $1 AND r.is_hidden = FALSE
      ORDER BY r.created_at DESC`,
      [req.params.listingId]
    );

    // Get average ratings
    const ratings = await query(
      'SELECT * FROM listing_ratings WHERE listing_id = $1',
      [req.params.listingId]
    );

    res.json({
      data: result.rows,
      ratings: ratings.rows[0] || null
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit review (must have verified inspection)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = createReviewSchema.parse(req.body);

    // Verify inspection exists and is verified
    const inspection = await query(
      'SELECT id FROM inspections WHERE id = $1 AND listing_id = $2 AND student_id = $3 AND verified_at IS NOT NULL',
      [data.inspectionId, data.listingId, req.user!.id]
    );

    if (inspection.rows.length === 0) {
      return res.status(403).json({ error: 'You must complete a verified inspection before reviewing' });
    }

    const result = await query(
      `INSERT INTO reviews (listing_id, student_id, inspection_id, rating, accuracy_rating, water_rating, electricity_rating, location_rating, comment)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [data.listingId, req.user!.id, data.inspectionId, data.rating,
        data.accuracyRating || null, data.waterRating || null,
        data.electricityRating || null, data.locationRating || null, data.comment || null]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: hide review
router.patch('/:id/hide', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'UPDATE reviews SET is_hidden = TRUE WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Hide review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
