import { Router } from 'express';
import authRoutes from './modules/auth';
import listingRoutes from './modules/listings';
import inspectionRoutes from './modules/inspections';
import reviewRoutes from './modules/reviews';
import savedRoutes from './modules/saved';
import reportRoutes from './modules/reports';
import adminRoutes from './modules/admin';
import { authenticate, AuthRequest } from './middleware/auth';
import { query } from './db';

const router = Router();

router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/inspections', inspectionRoutes);
router.use('/reviews', reviewRoutes);
router.use('/saved', savedRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

// Get current user
router.get('/users/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await query('SELECT id, email, name, role FROM profiles WHERE id = $1', [req.user!.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current user
router.patch('/users/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;
    const result = await query(
      'UPDATE profiles SET name = COALESCE($1, name), updated_at = now() WHERE id = $2 RETURNING id, email, name, role',
      [name, req.user!.id]
    );
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
