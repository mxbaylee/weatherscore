import { describe, expect, it } from 'vitest'
import { CityWeather } from './cityWeather.js'
import { vi } from 'vitest'

vi.mock('./weatherData.js')

describe('CityWeather', () => {
  // Tests
  describe('constructor', () => {
    it('creates a CityWeather object with valid timezone', () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      expect(cityWeather).toBeDefined();
    });
  });

  describe('airScoreStdev', () => {
    it('calculates score for no data', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.airQuality.fetch = vi.fn();
      cityWeather.airQuality.aqiDailyMax = vi.fn().mockReturnValue([]);
      const airQuality = await cityWeather.airScoreStdev();
      expect(airQuality).toBeNaN();
    });
    it('calculates average for more values', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.airQuality.fetch = vi.fn();
      cityWeather.airQuality.aqiDailyMax = vi.fn().mockReturnValue([100, 150, 50]);
      const airQuality = await cityWeather.airScoreStdev();
      expect(airQuality).toEqual(50);
    });
  });

  describe('airScore', () => {
    it('calculates score for no data', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.airQuality.fetch = vi.fn();
      cityWeather.airQuality.aqiDailyMax = vi.fn().mockReturnValue([]);
      const airQuality = await cityWeather.airScore();
      expect(airQuality).toEqual(0);
    });
    it('calculates average for more values', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.airQuality.fetch = vi.fn();
      cityWeather.airQuality.aqiDailyMax = vi.fn().mockReturnValue([100, 252, 500]);
      const airQuality = await cityWeather.airScore();
      expect(airQuality).toEqual(284);
    });
  })

  describe('overcastScore', () => {
    it('calculates score where sunshine is equal to daylight', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([7200]);
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200]);
      const overcastScore = await cityWeather.overcastScore();
      expect(overcastScore).toBe(0);
    })

    it('ignores NaN values', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([7200, NaN]);
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200, 200]);
      const overcastScore = await cityWeather.overcastScore();
      expect(overcastScore).toBe(0)
    })

    it('calculates zero score', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([0, 0]);
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200, 200]);
      const overcastScore = await cityWeather.overcastScore();
      expect(overcastScore).toBe(100);
    })
  })

  describe('sunshineScore', () => {
    it('calculates score where sunshine is equal to daylight', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([7200]);
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200]);
      const sunshineScore = await cityWeather.sunshineScore();
      expect(sunshineScore).toBe(100)
    })

    it('ignores NaN values', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([7200, NaN]);
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200, 200]);
      const sunshineScore = await cityWeather.sunshineScore();
      expect(sunshineScore).toBe(100)
    })

    it('calculates zero score', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([0, 0]);
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200, 200]);
      const sunshineScore = await cityWeather.sunshineScore();
      expect(sunshineScore).toBe(0)
    })
  })

  describe('temperatureBuckets', () => {
    it('returns empty buckets for no data', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();
      cityWeather.weather.dailyMaxTemp = vi.fn().mockReturnValue({});
      cityWeather.weather.dailyMinTemp = vi.fn().mockReturnValue({});

      const buckets = await cityWeather.temperatureBuckets();

      expect(buckets).toHaveLength(12);
      buckets.forEach(bucket => {
        expect(bucket.monthMinAverage).toBe(NaN);
        expect(bucket.monthMinStdev).toBe(NaN);
        expect(bucket.monthMaxAverage).toBe(NaN);
        expect(bucket.monthMaxStdev).toBe(NaN);
      });
    });

    it('calculates correct averages and stdevs for single month', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();

      // Mock data for January (month 0)
      const januaryTimestamps = {
        1704067200000: 30, // Jan 1
        1704153600000: 32, // Jan 2
        1704240000000: 28  // Jan 3
      };

      cityWeather.weather.dailyMaxTemp = vi.fn().mockReturnValue(januaryTimestamps);
      cityWeather.weather.dailyMinTemp = vi.fn().mockReturnValue(januaryTimestamps);

      const buckets = await cityWeather.temperatureBuckets();

      // Check January (month 0)
      expect(buckets[0].monthNumber).toBe(1);
      expect(buckets[0].monthMinAverage).toBe(30);
      expect(buckets[0].monthMaxAverage).toBe(30);

      // Check other months are empty
      for (let i = 1; i < 12; i++) {
        expect(buckets[i].monthMinAverage).toBe(NaN);
        expect(buckets[i].monthMaxAverage).toBe(NaN);
        expect(buckets[i].monthMinStdev).toBe(NaN);
        expect(buckets[i].monthMaxStdev).toBe(NaN);
      }
    });

    it('handles data across multiple months', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();

      // Mock data for January and February
      const minTimestamps = {
        1704067200000: 30, // Jan 1
        1704153600000: 32, // Jan 2
        1706745600000: 35, // Feb 1
        1706832000000: 33  // Feb 2
      };
      const maxTimestamps = {
        1704067200000: 36, // Jan 1
        1704153600000: 32, // Jan 2
        1706745600000: 37, // Feb 1
        1706832000000: 33  // Feb 2
      };

      cityWeather.weather.dailyMaxTemp = vi.fn().mockReturnValue(maxTimestamps);
      cityWeather.weather.dailyMinTemp = vi.fn().mockReturnValue(minTimestamps);

      const buckets = await cityWeather.temperatureBuckets();

      // Check January (month 0)
      expect(buckets[0].monthNumber).toBe(1);
      expect(buckets[0].monthMinAverage).toBe(31);
      expect(buckets[0].monthMaxAverage).toBe(34);

      // Check February (month 1)
      expect(buckets[1].monthNumber).toBe(2);
      expect(buckets[1].monthMinAverage).toBe(34);
      expect(buckets[1].monthMaxAverage).toBe(35);

      // Check other months are empty
      for (let i = 2; i < 12; i++) {
        expect(buckets[i].monthMinAverage).toBe(NaN);
        expect(buckets[i].monthMaxAverage).toBe(NaN);
        expect(buckets[i].monthMinStdev).toBe(NaN);
        expect(buckets[i].monthMaxStdev).toBe(NaN);
      }
    });
  });
})
