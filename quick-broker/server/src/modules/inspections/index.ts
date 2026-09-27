import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../db';
import { authenticate, requireAdmin, AuthRequest } from '../../middleware/auth';

const router = Router();

const requestSchema = z.object({
  listingId: z.string().uuid(),
  preferredTime: z.string().datetime().optional()
});

// Student: request inspection
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { listingId, preferredTime } = requestSchema.parse(req.body);

    // Check listing exists and is available
    const listing = await query('SELECT id, status FROM listings WHERE id = $1', [listingId]);
    if (listing.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (listing.rows[0].status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Listing is not available' });
    }

    const result = await query(
      `INSERT INTO inspections (listing_id, student_id, preferred_time)
      VALUES ($1, $2, $3) RETURNING *`,
      [listingId, req.user!.id, preferredTime ? new Date(preferredTime) : null]
    );

    // Update listing status
    await query("UPDATE listings SET status = 'INSPECTION_PENDING' WHERE id = $1", [listingId]);

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Request inspection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: list all inspections
router.get('/', authenticate, requireAdmin, async (_req, res) => {
  try {
    const result = await query(
      `SELECT i.*, l.title as listing_title, p.name as student_name, p.email as student_email
      FROM inspections i
      JOIN listings l ON i.listing_id = l.id
      JOIN profiles p ON i.student_id = p.id
      ORDER BY i.created_at DESC`
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('List inspections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student: my inspections
router.get('/my', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT i.*, l.title as listing_title, l.area, l.distance_from_kiu
      FROM inspections i
      JOIN listings l ON i.listing_id = l.id
      WHERE i.student_id = $1
      ORDER BY i.created_at DESC`,
      [req.user!.id]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('My inspections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single inspection
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `SELECT i.*, l.title as listing_title, l.area, l.distance_from_kiu, l.landlord_phone
      FROM inspections i
      JOIN listings l ON i.listing_id = l.id
      WHERE i.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    const inspection = result.rows[0];
    // Only student or admin can view
    if (inspection.student_id !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ data: inspection });
  } catch (error) {
    console.error('Get inspection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: accept inspection (generates one-time code)
router.patch('/:id/accept', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await query('SELECT accept_inspection($1) as code', [req.params.id]);
    const code = result.rows[0].code;

    // Get inspection details for response
    const inspection = await query(
      `SELECT i.*, l.title as listing_title FROM inspections i JOIN listings l ON i.listing_id = l.id WHERE i.id = $1`,
      [req.params.id]
    );

    res.json({ data: inspection.rows[0], code });
  } catch (error) {
    console.error('Accept inspection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: decline inspection
router.patch('/:id/decline', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      "UPDATE inspections SET status = 'DECLINED' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Reset listing status
    await query("UPDATE listings SET status = 'AVAILABLE' WHERE id = $1", [result.rows[0].listing_id]);

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Decline inspection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: reschedule inspection
router.patch('/:id/reschedule', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { proposedTime } = req.body;
    if (!proposedTime) {
      return res.status(400).json({ error: 'Proposed time required' });
    }

    const result = await query(
      "UPDATE inspections SET status = 'RESCHEDULED', proposed_time = $1 WHERE id = $2 RETURNING *",
      [new Date(proposedTime), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Reschedule inspection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student: view inspection code
router.get('/:id/code', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      'SELECT one_time_code_hash, code_expires_at FROM inspections WHERE id = $1 AND student_id = $2',
      [req.params.id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Return a masked version - in production, this would be shown after verification
    res.json({ message: 'Code available', expiresAt: result.rows[0].code_expires_at });
  } catch (error) {
    console.error('Get code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: verify inspection code
router.post('/:id/verify', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code required' });
    }

    const result = await query('SELECT verify_inspection_code($1, $2) as verified', [req.params.id, code]);

    if (!result.rows[0].verified) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    res.json({ message: 'Inspection verified' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student: mark interested
router.post('/:id/interested', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      "UPDATE inspections SET status = 'INTERESTED' WHERE id = $1 AND student_id = $2 RETURNING *",
      [req.params.id, req.user!.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Mark interested error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student: mark not interested
router.post('/:id/not-interested', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      "UPDATE inspections SET status = 'NOT_INTERESTED' WHERE id = $1 AND student_id = $2 RETURNING *",
      [req.params.id, req.user!.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Reset listing status
    await query("UPDATE listings SET status = 'AVAILABLE' WHERE id = $1", [result.rows[0].listing_id]);

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Mark not interested error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student: mark rented
router.post('/:id/rented', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      "UPDATE inspections SET status = 'RENTED' WHERE id = $1 AND student_id = $2 RETURNING *",
      [req.params.id, req.user!.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Mark listing as occupied
    await query("UPDATE listings SET status = 'OCCUPIED' WHERE id = $1", [result.rows[0].listing_id]);

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Mark rented error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
