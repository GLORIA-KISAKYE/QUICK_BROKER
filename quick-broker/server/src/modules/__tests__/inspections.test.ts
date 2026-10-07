import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const requestSchema = z.object({
  listingId: z.string().uuid(),
  preferredTime: z.string().datetime().optional(),
});

describe('inspection validation', () => {
  it('accepts valid inspection request', () => {
    const result = requestSchema.safeParse({
      listingId: '550e8400-e29b-41d4-a716-446655440000',
      preferredTime: '2026-10-05T10:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('accepts without preferred time', () => {
    const result = requestSchema.safeParse({
      listingId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID', () => {
    const result = requestSchema.safeParse({
      listingId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing listingId', () => {
    const result = requestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
