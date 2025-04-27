import { describe, expect, it } from 'vitest'
import { stdev } from './util.js'
import { vi } from 'vitest'

describe('util', () => {
  describe('stdev', () => {
    it('calculates standard deviation for a simple set', () => {
      const data = [1, 2, 3, 4];
      const stdDev = stdev(data);
      expect(stdDev).toBeCloseTo(1.291, 2);
    });

    it('calculates standard deviation with 10 median', () => {
      const data = [10, 5, 15, 15, 5];
      const stdDev = stdev(data);
      expect(stdDev).toBeCloseTo(5);
    });
  });
});
