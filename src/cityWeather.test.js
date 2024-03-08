import { describe, expect, it } from 'vitest'
import { CityWeather } from './cityWeather.js'
import { vi } from 'vitest'

vi.mock('./weatherData.js')

describe('CityWeather', () => {
  // Tests
  describe('constructor', () => {
    it('throws error for invalid timezone', () => {
      expect(() => {
        new CityWeather({ latitude: 10, longitude: 20, tz: 'invalid' })
      }).toThrowError('TZ not found: invalid')
    })

    it('creates a CityWeather object with valid timezone', () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      expect(cityWeather).toBeDefined()
      expect(cityWeather.tzoffset).toBe(-8); // Offset for Pacific Time (PT)
    })
  })

  describe('overcastScore', () => {
    it('calculates max overcast score', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' });
      cityWeather.weather.hourlyCloudCover = vi.fn().mockReturnValue([
        100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
      ])
      cityWeather.weather.timeSeries = vi.fn().mockReturnValue([
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
      ])
      cityWeather.weather.totalDays = vi.fn().mockReturnValue(1)
      cityWeather.isDaytime = vi.fn().mockReturnValue(true)

      const overcastScore = await cityWeather.overcastScore()
      expect(overcastScore).toBeCloseTo(100, 1)
    })

    it('calculates min overcast score', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' });
      cityWeather.weather.hourlyCloudCover = vi.fn().mockReturnValue([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ])
      cityWeather.weather.timeSeries = vi.fn().mockReturnValue([
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
      ])
      cityWeather.weather.totalDays = vi.fn().mockReturnValue(1)
      cityWeather.isDaytime = vi.fn().mockReturnValue(true)

      const overcastScore = await cityWeather.overcastScore()
      expect(overcastScore).toBeCloseTo(0, 1)
    })
  })

  describe('avgTemp', () => {
    it('calculates average temperature ignoring invalid values', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.dailyMeanTemp = vi.fn().mockReturnValue([15, NaN, 20])
      const avgTemp = await cityWeather.avgTemp()
      expect(avgTemp).toBeCloseTo(17.5, 2)
    })

    it('calculates average temperature for a single valid value', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.dailyMeanTemp = vi.fn().mockReturnValue([18])
      const avgTemp = await cityWeather.avgTemp()
      expect(avgTemp).toBe(18)
    })
  })

  describe('sunshineScore', () => {
    it('calculates score where sunshine is equal to daylight', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([7200])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200])
      const avgTemp = await cityWeather.sunshineScore()
      expect(avgTemp).toBe(100)
    })

    it('ignores NaN values', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([7200, NaN])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200, 200])
      const avgTemp = await cityWeather.sunshineScore()
      expect(avgTemp).toBe(100)
    })

    it('calculates zero score', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([0, 0])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200, 200])
      const avgTemp = await cityWeather.sunshineScore()
      expect(avgTemp).toBe(0)
    })
  })
})
