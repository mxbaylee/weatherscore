import { describe, expect, it } from 'vitest'
import { AirQualityData } from './airQualityData.js'
import { vi } from 'vitest'

describe('AirQualityData', () => {
  // Tests
  describe('aqiDailyMax', () => {
    it('returns a single value', () => {
      const aqData = new AirQualityData({ latitude: 10, longitude: 20 });
      aqData.fetch = vi.fn();
      aqData.aqi = vi.fn().mockReturnValue([10]);
      expect(aqData.aqiDailyMax()).toEqual([10]);
    });
    it('returns value for a single day', () => {
      const aqData = new AirQualityData({ latitude: 10, longitude: 20 });
      aqData.fetch = vi.fn();
      aqData.aqi = vi.fn().mockReturnValue([
        // 24 values represents 24 hours or 1 day
        500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]);
      expect(aqData.aqiDailyMax()).toEqual([500]);
    });
    it('handles multiple days including Nan values', () => {
      const aqData = new AirQualityData({ latitude: 10, longitude: 20 });
      aqData.fetch = vi.fn();
      aqData.aqi = vi.fn().mockReturnValue([
        // 24 values per day
        500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        NaN,
      ]);
      expect(aqData.aqiDailyMax()).toEqual([500, 250]);
    });
  });
});
