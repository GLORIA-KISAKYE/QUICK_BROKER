import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../../db';
import { config } from '../../config';
import { authLimiter } from '../../middleware/rateLimit';
import { authenticate, AuthRequest } from '../../middleware/auth';

const router = Router();

const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['STUDENT', 'LANDLORD'])
});

// Verify OTP (legacy — kept for backward compatibility)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code } = verifyOtpSchema.parse(req.body);

    const result = await query(
      'SELECT id, code_hash FROM auth_otp_codes WHERE email = $1 AND used = FALSE AND expires_at > now() ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid or expired code' });

    const { id, code_hash } = result.rows[0];
    const valid = await bcrypt.compare(code, code_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid code' });

    await query('UPDATE auth_otp_codes SET used = TRUE WHERE id = $1', [id]);

    let userResult = await query('SELECT id, email, name, role FROM profiles WHERE email = $1', [email]);
    let user = userResult.rows[0];
    if (!user) return res.status(400).json({ error: 'User not registered' });

    const accessToken = jwt.sign({ userId: user.id, email: user.email, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
    const refreshToken = jwt.sign({ userId: user.id }, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiresIn });
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await query('INSERT INTO auth_refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)', [user.id, refreshHash, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]);

    res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register (Student or Landlord)
router.post('/register', async (req, res) => {
  try {
    const { email, name, role } = registerSchema.parse(req.body);
    const existing = await query('SELECT id FROM profiles WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Email already registered' });

    const result = await query('INSERT INTO profiles (email, name, role) VALUES ($1, $2, $3) RETURNING id, email, name, role', [email, name, role]);
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send OTP (legacy — kept for backward compatibility)
router.post('/send-otp', authLimiter, async (req, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await query('UPDATE auth_otp_codes SET used = TRUE WHERE email = $1 AND used = FALSE', [email]);
    await query('INSERT INTO auth_otp_codes (email, code_hash, expires_at) VALUES ($1, $2, $3)', [email, codeHash, expiresAt]);
    // Send via magic link email for consistency
    res.json({ message: 'Please use magic link login instead', isNewUser: false });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
