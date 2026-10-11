import { Router } from 'express';
import { query } from '../../db';
import { authenticate, requireAdmin, AuthRequest } from '../../middleware/auth';

const router = Router();

// Admin: list all listings
router.get('/listings', authenticate, requireAdmin, async (_req, res) => {
  try {
    const result = await query('SELECT * FROM listings ORDER BY created_at DESC');
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Admin list listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: get dashboard stats
router.get('/stats', authenticate, requireAdmin, async (_req, res) => {
  try {
    const [listings, students, landlords, inspections, reviews] = await Promise.all([
      query('SELECT COUNT(*) FROM listings'),
      query("SELECT COUNT(*) FROM profiles WHERE role = 'STUDENT'"),
      query("SELECT COUNT(*) FROM profiles WHERE role = 'LANDLORD'"),
      query('SELECT COUNT(*) FROM inspections'),
      query('SELECT COUNT(*) FROM reviews')
    ]);

    res.json({
      totalListings: parseInt(listings.rows[0].count),
      totalStudents: parseInt(students.rows[0].count),
      totalLandlords: parseInt(landlords.rows[0].count),
      totalInspections: parseInt(inspections.rows[0].count),
      totalReviews: parseInt(reviews.rows[0].count)
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: list landlord verifications
router.get('/verifications', authenticate, requireAdmin, async (_req, res) => {
  try {
    const result = await query(
      `SELECT lv.*, p.name as landlord_name, p.email as landlord_email
      FROM landlord_verifications lv
      JOIN profiles p ON lv.landlord_id = p.id
      ORDER BY lv.created_at DESC`
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Admin verifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: approve landlord verification
router.patch('/verifications/:id/approve', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await query(
      `UPDATE landlord_verifications
      SET status = 'APPROVED', reviewed_by = $1, reviewed_at = now()
      WHERE id = $2
      RETURNING *`,
      [req.user!.id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    // Update profile
    await query(
      'UPDATE profiles SET is_identity_verified = TRUE WHERE id = $1',
      [result.rows[0].landlord_id]
    );

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: reject landlord verification
router.patch('/verifications/:id/reject', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { reason } = req.body;
    const result = await query(
      `UPDATE landlord_verifications
      SET status = 'REJECTED', reviewed_by = $1, reviewed_at = now(), rejection_reason = $2
      WHERE id = $3
      RETURNING *`,
      [req.user!.id, reason || 'Does not meet requirements', req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Verification not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
