import { describe, expect, it } from 'vitest'
import { CityWeather } from './cityWeather.js'
import { vi } from 'vitest'

vi.mock('./weatherData.js')

describe('CityWeather', () => {
  // Tests
  describe('constructor', () => {
    it('creates a CityWeather object with valid timezone', () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20 })
      expect(cityWeather).toBeDefined()
    })
  })

  describe('airScore', () => {
    it('calculates score for no data', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.airQuality.fetch = vi.fn()
      cityWeather.airQuality.aqi = vi.fn().mockReturnValue([])
      const airQuality = await cityWeather.airScore()
      expect(airQuality).toEqual(0)
    })
    it('calculates score for no bad days', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.airQuality.fetch = vi.fn()
      cityWeather.airQuality.aqi = vi.fn().mockReturnValue([0, 0, 0])
      const airQuality = await cityWeather.airScore()
      expect(airQuality).toEqual(0)
    })
    it('calculates score for max hazard days', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.airQuality.fetch = vi.fn()
      cityWeather.airQuality.aqi = vi.fn().mockReturnValue([500, 500, 500])
      const airQuality = await cityWeather.airScore()
      expect(airQuality).toEqual(500)
    })
    it('calculates score for mixed bad/worse/hazard in a single day', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.airQuality.fetch = vi.fn()
      cityWeather.airQuality.aqi = vi.fn().mockReturnValue([0, 0, 0, 200, 200, 500, 500, 500])
      const airQuality = await cityWeather.airScore()
      expect(airQuality).toEqual(500)
    })
    it('calculates score for mixed bad/worse/hazard for multiple days', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.airQuality.fetch = vi.fn()
      cityWeather.airQuality.aqi = vi.fn().mockReturnValue([
        500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ])
      const airQuality = await cityWeather.airScore()
      expect(airQuality).toEqual(375)
    })
    it('calculates score for mixed bad/worse/hazard for multiple days with missing days', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.airQuality.fetch = vi.fn()
      cityWeather.airQuality.aqi = vi.fn().mockReturnValue([
        500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        250, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        NaN,
      ])
      const airQuality = await cityWeather.airScore()
      expect(airQuality).toEqual(375)
    })
  })

  describe('stdevTemp', () => {
    it('calculates stdev of a few temps', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.fetch = vi.fn()
      cityWeather.weather.dailyMeanTemp = vi.fn().mockReturnValue([15, 20, 25])
      const stdevTemp = await cityWeather.stdevTemp()
      expect(stdevTemp).toEqual(5)
    })
  })

  describe('avgTemp', () => {
    it('calculates average temperature ignoring invalid values', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.fetch = vi.fn()
      cityWeather.weather.dailyMeanTemp = vi.fn().mockReturnValue([15, NaN, 20])
      const avgTemp = await cityWeather.avgTemp()
      expect(avgTemp).toBeCloseTo(17.5, 2)
    })

    it('calculates average temperature for a single valid value', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.fetch = vi.fn()
      cityWeather.weather.dailyMeanTemp = vi.fn().mockReturnValue([18])
      const avgTemp = await cityWeather.avgTemp()
      expect(avgTemp).toBe(18)
    })
  })

  describe('overcastScore', () => {
    it('calculates score where sunshine is equal to daylight', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.fetch = vi.fn()
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([7200])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200])
      const overcastScore = await cityWeather.overcastScore()
      expect(overcastScore).toBe(0)
    })

    it('ignores NaN values', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.fetch = vi.fn()
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([7200, NaN])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200, 200])
      const overcastScore = await cityWeather.overcastScore()
      expect(overcastScore).toBe(0)
    })

    it('calculates zero score', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.fetch = vi.fn()
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([0, 0])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200, 200])
      const overcastScore = await cityWeather.overcastScore()
      expect(overcastScore).toBe(100)
    })
  })

  describe('sunshineScore', () => {
    it('calculates score where sunshine is equal to daylight', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.fetch = vi.fn()
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([7200])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200])
      const sunshineScore = await cityWeather.sunshineScore()
      expect(sunshineScore).toBe(100)
    })

    it('ignores NaN values', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.fetch = vi.fn()
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([7200, NaN])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200, 200])
      const sunshineScore = await cityWeather.sunshineScore()
      expect(sunshineScore).toBe(100)
    })

    it('calculates zero score', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.fetch = vi.fn()
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([0, 0])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200, 200])
      const sunshineScore = await cityWeather.sunshineScore()
      expect(sunshineScore).toBe(0)
    })
  })
})
