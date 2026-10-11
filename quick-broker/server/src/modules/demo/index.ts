import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../db';
import { config } from '../../config';

const router = Router();

// Demo login — instant access for preview purposes
router.post('/login', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['STUDENT', 'LANDLORD', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const email = `demo-${role.toLowerCase()}@quickbroker.com`;
    const result = await query('SELECT id, email, name, role FROM profiles WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Demo user not found. Run migration 019.' });
    }

    const user = result.rows[0];
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn }
    );

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await query(
      'INSERT INTO auth_refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshHash, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
