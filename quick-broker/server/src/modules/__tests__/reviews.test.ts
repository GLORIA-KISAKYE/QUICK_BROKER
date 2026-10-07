import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const createReviewSchema = z.object({
  listingId: z.string().uuid(),
  inspectionId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  accuracyRating: z.number().min(1).max(5).optional(),
  waterRating: z.number().min(1).max(5).optional(),
  electricityRating: z.number().min(1).max(5).optional(),
  locationRating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
});

describe('review validation', () => {
  const validReview = {
    listingId: '550e8400-e29b-41d4-a716-446655440000',
    inspectionId: '550e8400-e29b-41d4-a716-446655440001',
    rating: 5,
  };

  it('accepts valid review', () => {
    const result = createReviewSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it('rejects rating below 1', () => {
    const result = createReviewSchema.safeParse({ ...validReview, rating: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects rating above 5', () => {
    const result = createReviewSchema.safeParse({ ...validReview, rating: 6 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID', () => {
    const result = createReviewSchema.safeParse({ ...validReview, listingId: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('accepts review with all ratings', () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      accuracyRating: 4,
      waterRating: 3,
      electricityRating: 5,
      locationRating: 4,
      comment: 'Great place!',
    });
    expect(result.success).toBe(true);
  });
});
