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

  describe('overcastScore', () => {
    it('calculates score where sunshine is equal to daylight', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([7200])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200])
      const overcastScore = await cityWeather.overcastScore()
      expect(overcastScore).toBe(0)
    })

    it('ignores NaN values', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([7200, NaN])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200, 200])
      const overcastScore = await cityWeather.overcastScore()
      expect(overcastScore).toBe(0)
    })

    it('calculates zero score', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([0, 0])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200, 200])
      const overcastScore = await cityWeather.overcastScore()
      expect(overcastScore).toBe(100)
    })
  })

  describe('sunshineScore', () => {
    it('calculates score where sunshine is equal to daylight', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([7200])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200])
      const sunshineScore = await cityWeather.sunshineScore()
      expect(sunshineScore).toBe(100)
    })

    it('ignores NaN values', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([7200, NaN])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200, 200])
      const sunshineScore = await cityWeather.sunshineScore()
      expect(sunshineScore).toBe(100)
    })

    it('calculates zero score', async () => {
      const cityWeather = new CityWeather({ latitude: 10, longitude: 20, tz: 'pt' })
      cityWeather.weather.dailySunshine = vi.fn().mockReturnValue([0, 0])
      cityWeather.weather.dailyDaylight = vi.fn().mockReturnValue([7200, 200])
      const sunshineScore = await cityWeather.sunshineScore()
      expect(sunshineScore).toBe(0)
    })
  })
})
