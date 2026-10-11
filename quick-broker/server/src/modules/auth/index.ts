import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../../db';
import { config } from '../../config';
import { sendOtpEmail } from '../../utils/email';
import { authLimiter } from '../../middleware/rateLimit';
import { authenticate, AuthRequest } from '../../middleware/auth';

const router = Router();

const sendOtpSchema = z.object({
  email: z.string().email()
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['STUDENT', 'LANDLORD'])
});

// Send OTP
router.post('/send-otp', authLimiter, async (req, res) => {
  try {
    const { email } = sendOtpSchema.parse(req.body);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await query('UPDATE auth_otp_codes SET used = TRUE WHERE email = $1 AND used = FALSE', [email]);

    await query(
      'INSERT INTO auth_otp_codes (email, code_hash, expires_at) VALUES ($1, $2, $3)',
      [email, codeHash, expiresAt]
    );

    const sent = await sendOtpEmail(email, code);
    if (!sent) {
      return res.status(500).json({ error: 'Failed to send email' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code } = verifyOtpSchema.parse(req.body);

    const result = await query(
      'SELECT id, code_hash FROM auth_otp_codes WHERE email = $1 AND used = FALSE AND expires_at > now() ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    const { id, code_hash } = result.rows[0];
    const valid = await bcrypt.compare(code, code_hash);

    if (!valid) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    await query('UPDATE auth_otp_codes SET used = TRUE WHERE id = $1', [id]);

    let userResult = await query('SELECT id, email, role FROM profiles WHERE email = $1', [email]);
    let user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'User not registered. Please register first.' });
    }

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
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register (Student or Landlord)
router.post('/register', async (req, res) => {
  try {
    const { email, name, role } = registerSchema.parse(req.body);

    const existing = await query('SELECT id FROM profiles WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const result = await query(
      'INSERT INTO profiles (email, name, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, name, role]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { userId: string };

    const result = await query(
      'SELECT token_hash FROM auth_refresh_tokens WHERE user_id = $1 AND expires_at > now()',
      [decoded.userId]
    );

    let valid = false;
    for (const row of result.rows) {
      if (await bcrypt.compare(refreshToken, row.token_hash)) {
        valid = true;
        break;
      }
    }

    if (!valid) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const userResult = await query('SELECT id, email, role FROM profiles WHERE id = $1', [decoded.userId]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
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
