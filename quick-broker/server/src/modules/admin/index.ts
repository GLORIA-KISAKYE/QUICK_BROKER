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
    const [listings, users, inspections, reviews] = await Promise.all([
      query('SELECT COUNT(*) FROM listings'),
      query("SELECT COUNT(*) FROM profiles WHERE role = 'STUDENT'"),
      query('SELECT COUNT(*) FROM inspections'),
      query('SELECT COUNT(*) FROM reviews')
    ]);

    res.json({
      totalListings: parseInt(listings.rows[0].count),
      totalStudents: parseInt(users.rows[0].count),
      totalInspections: parseInt(inspections.rows[0].count),
      totalReviews: parseInt(reviews.rows[0].count)
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
