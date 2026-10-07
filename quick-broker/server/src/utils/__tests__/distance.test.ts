import { describe, it, expect } from 'vitest';
import { calculateDistance, distanceFromKiu, bodaTime, walkTime } from '../distance';

describe('distance utils', () => {
  it('calculates distance between two points', () => {
    const d = calculateDistance(0, 0, 0, 1);
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(112);
  });

  it('returns 0 for same point', () => {
    expect(calculateDistance(0, 0, 0, 0)).toBe(0);
  });

  it('calculates distance from KIU', () => {
    const d = distanceFromKiu(-0.5587, 30.1442);
    expect(d).toBe(0);
  });

  it('calculates boda time', () => {
    expect(bodaTime(10)).toBe(30);
    expect(bodaTime(5)).toBe(15);
  });

  it('calculates walk time', () => {
    expect(walkTime(5)).toBe(60);
    expect(walkTime(2)).toBe(24);
  });
});
