import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const createReportSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.enum(['INACCURATE', 'SUSPICIOUS', 'FAKE', 'OTHER']),
  details: z.string().optional(),
});

describe('report validation', () => {
  const validReport = {
    listingId: '550e8400-e29b-41d4-a716-446655440000',
    reason: 'INACCURATE',
  };

  it('accepts valid report', () => {
    const result = createReportSchema.safeParse(validReport);
    expect(result.success).toBe(true);
  });

  it('accepts report with details', () => {
    const result = createReportSchema.safeParse({
      ...validReport,
      details: 'The photos do not match the actual property',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid reason', () => {
    const result = createReportSchema.safeParse({ ...validReport, reason: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID', () => {
    const result = createReportSchema.safeParse({ ...validReport, listingId: 'invalid' });
    expect(result.success).toBe(false);
  });
});
