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
      expect(airQuality).toBeCloseTo(0, 0);
    });
    it('calculates average for more values', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.airQuality.fetch = vi.fn();
      cityWeather.airQuality.aqiDailyMax = vi.fn().mockReturnValue([100, 150, 50]);
      const airQuality = await cityWeather.airScoreStdev();
      expect(airQuality).toEqual(50);
    });
  });

  describe('dailiyMax', () => {
    it('calculates stdev of a few temps', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();
      cityWeather.weather.dailyMaxTemp = vi.fn().mockReturnValue([15, 20, 25]);
      const stdevTemp = await cityWeather.stdevMaxTemp();
      expect(stdevTemp).toEqual(5);
    });

    it('calculates average temperature ignoring invalid values', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();
      cityWeather.weather.dailyMaxTemp = vi.fn().mockReturnValue([15, NaN, 20]);
      const avgTemp = await cityWeather.avgMaxTemp();
      expect(avgTemp).toBeCloseTo(17.5, 2);
    });

    it('calculates average temperature for a single valid value', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();
      cityWeather.weather.dailyMaxTemp = vi.fn().mockReturnValue([18]);
      const avgTemp = await cityWeather.avgMaxTemp();
      expect(avgTemp).toBe(18);
    });
  });

  describe('dailyMin', () => {
    it('calculates stdev of a few temps', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();
      cityWeather.weather.dailyMinTemp = vi.fn().mockReturnValue([15, 20, 25]);
      const stdevTemp = await cityWeather.stdevMinTemp();
      expect(stdevTemp).toEqual(5);
    });

    it('calculates average temperature ignoring invalid values', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();
      cityWeather.weather.dailyMinTemp = vi.fn().mockReturnValue([15, NaN, 20]);
      const avgTemp = await cityWeather.avgMinTemp();
      expect(avgTemp).toBeCloseTo(17.5, 2);
    });

    it('calculates average temperature for a single valid value', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 });
      cityWeather.weather.fetch = vi.fn();
      cityWeather.weather.dailyMinTemp = vi.fn().mockReturnValue([18]);
      const avgTemp = await cityWeather.avgMinTemp();
      expect(avgTemp).toBe(18);
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
})
