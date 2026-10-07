import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const createListingSchema = z.object({
  title: z.string().min(1),
  houseType: z.enum(['SINGLE_ROOM', 'DOUBLE_ROOM', 'SELF_CONTAINED_SINGLE', 'SELF_CONTAINED_DOUBLE', 'OTHER']),
  rentAmount: z.number().positive(),
  area: z.string().min(1),
  electricity: z.enum(['INCLUDED', 'SHARED_BILL', 'PERSONAL_BILL']).optional(),
  water: z.enum(['INCLUDED', 'SHARED_PAYMENT', 'STUDENT_PAYS', 'COMMUNITY_TAP']).optional(),
  kitchen: z.enum(['PRESENT', 'NOT_PRESENT']).optional(),
  bathroom: z.enum(['PRIVATE', 'SHARED']).optional(),
  toilet: z.enum(['PRIVATE', 'SHARED']).optional(),
  flooring: z.enum(['TILED', 'CEMENTED']).optional(),
  otherCharges: z.string().optional(),
  landlordPhone: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

describe('listing validation', () => {
  const validListing = {
    title: 'Double Room in Kakoba',
    houseType: 'DOUBLE_ROOM',
    rentAmount: 280000,
    area: 'Kakoba',
  };

  it('accepts valid listing', () => {
    const result = createListingSchema.safeParse(validListing);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createListingSchema.safeParse({ ...validListing, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid house type', () => {
    const result = createListingSchema.safeParse({ ...validListing, houseType: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('rejects negative rent', () => {
    const result = createListingSchema.safeParse({ ...validListing, rentAmount: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects zero rent', () => {
    const result = createListingSchema.safeParse({ ...validListing, rentAmount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects empty area', () => {
    const result = createListingSchema.safeParse({ ...validListing, area: '' });
    expect(result.success).toBe(false);
  });

  it('accepts listing with all optional fields', () => const result = createListingSchema.safeParse({
    ...validListing,
    electricity: 'SHARED_BILL',
    water: 'COMMUNITY_TAP',
    kitchen: 'PRESENT',
    bathroom: 'SHARED',
    toilet: 'SHARED',
    flooring: 'TILED',
    otherCharges: 'Security deposit UGX 100k',
    landlordPhone: '0700123456',
    latitude: -0.5587,
    longitude: 30.1442,
  });
  expect(result.success).toBe(true);
});
