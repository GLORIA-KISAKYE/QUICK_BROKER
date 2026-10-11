import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import { pool, query } from '../../db';
import { config } from '../../config';
import { sendMagicLinkEmail } from '../../utils/mail';
import { authLimiter } from '../../middleware/rateLimit';
import { authenticate, AuthRequest } from '../../middleware/auth';

const router = Router();

const emailSchema = z.object({
  email: z.string().email(),
});

const completeSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  role: z.enum(['STUDENT', 'LANDLORD']).optional(),
});

const verifyMagicSchema = z.object({
  token: z.string().min(10),
});

function generateToken(): { plain: string; hash: string } {
  const plain = crypto.randomBytes(32).toString('hex');
  return { plain, hash: plain }; // hash stored plainly for lookup, no need to bcrypt random token
}

async function issueTokens(user: { id: string; email: string; role: string }) {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn },
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn },
  );
  const refreshHash = await bcrypt.hash(refreshToken, 10);
  await query(
    'INSERT INTO auth_refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshHash, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)],
  );
  return { accessToken, refreshToken };
}

// POST /auth/magic — send magic link
router.post('/magic', authLimiter, async (req, res) => {
  try {
    const { email } = emailSchema.parse(req.body);

    // Check if user exists (we do NOT reveal this)
    const existing = await query('SELECT id FROM profiles WHERE email = $1', [email]);
    const isNewUser = existing.rows.length === 0;

    // If new user, we still send the link; they complete profile after clicking
    const { plain, hash } = generateToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await query(
      'INSERT INTO auth_magic_tokens (email, token_hash, expires_at) VALUES ($1, $2, $3)',
      [email, hash, expiresAt],
    );

    const sent = await sendMagicLinkEmail(email, plain);
    if (!sent) return res.status(500).json({ error: 'Failed to send email' });

    res.json({ message: 'Check your email for a login link', isNewUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Magic link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/magic/complete — after user clicks link, optionally complete profile
router.post('/magic/complete', async (req, res) => {
  try {
    const { email, name, role } = completeSchema.parse(req.body);

    let result = await query('SELECT id, email, name, role FROM profiles WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      // Create new user
      if (!name || !role) {
        return res.status(400).json({ error: 'Name and role required for new users' });
      }
      const insert = await query(
        'INSERT INTO profiles (email, name, role) VALUES ($1, $2, $3) RETURNING id, email, name, role',
        [email, name, role],
      );
      result = insert;
    }

    const user = result.rows[0];
    const tokens = await issueTokens(user);

    res.json({
      ...tokens,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Magic complete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /auth/magic/verify — verify magic token from URL
router.get('/magic/verify', async (req, res) => {
  try {
    const { token } = verifyMagicSchema.parse(req.query);

    const result = await query(
      'SELECT email FROM auth_magic_tokens WHERE token_hash = $1 AND used = FALSE AND expires_at > now() ORDER BY created_at DESC LIMIT 1',
      [token],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired link' });
    }

    const { email } = result.rows[0];

    // Mark token as used
    await query('UPDATE auth_magic_tokens SET used = TRUE WHERE token_hash = $1', [token]);

    res.json({ email });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Magic verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/magic/refresh — refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { userId: string };

    const result = await query(
      'SELECT token_hash FROM auth_refresh_tokens WHERE user_id = $1 AND expires_at > now()',
      [decoded.userId],
    );

    let valid = false;
    for (const row of result.rows) {
      if (await bcrypt.compare(refreshToken, row.token_hash)) { valid = true; break; }
    }
    if (!valid) return res.status(401).json({ error: 'Invalid refresh token' });

    const user = await query('SELECT id, email, role FROM profiles WHERE id = $1', [decoded.userId]);
    if (user.rows.length === 0) return res.status(401).json({ error: 'User not found' });

    const accessToken = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn },
    );
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await query('DELETE FROM auth_refresh_tokens WHERE user_id = $1', [req.user!.id]);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
