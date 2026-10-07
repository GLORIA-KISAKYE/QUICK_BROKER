import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';

// Test validation schemas
const sendOtpSchema = z.object({
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

describe('auth validation', () => {
  it('accepts valid email', () => {
    const result = sendOtpSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = sendOtpSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = sendOtpSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('accepts valid OTP data', () => {
    const result = verifyOtpSchema.safeParse({ email: 'test@example.com', code: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejects short code', () => {
    const result = verifyOtpSchema.safeParse({ email: 'test@example.com', code: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects long code', () => {
    const result = verifyOtpSchema.safeParse({ email: 'test@example.com', code: '1234567' });
    expect(result.success).toBe(false);
  });
});
