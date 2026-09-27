import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../db';
import { authenticate, requireAdmin, AuthRequest } from '../../middleware/auth';

const router = Router();

const createReportSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.enum(['INACCURATE', 'SUSPICIOUS', 'FAKE', 'OTHER']),
  details: z.string().optional()
});

// Report a listing
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = createReportSchema.parse(req.body);

    const result = await query(
      'INSERT INTO reports (listing_id, reporter_id, reason, details) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.listingId, req.user!.id, data.reason, data.details || null]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: list all reports
router.get('/', authenticate, requireAdmin, async (_req, res) => {
  try {
    const result = await query(
      `SELECT r.*, l.title as listing_title, p.name as reporter_name
      FROM reports r
      JOIN listings l ON r.listing_id = l.id
      JOIN profiles p ON r.reporter_id = p.id
      ORDER BY r.created_at DESC`
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('List reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: resolve report
router.patch('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    if (!['REVIEWED', 'RESOLVED', 'DISMISSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await query(
      'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: suspend listing
router.patch('/listings/:id/suspend', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      "UPDATE listings SET status = 'SUSPENDED' WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Suspend listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
