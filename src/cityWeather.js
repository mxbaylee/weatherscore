import { WeatherData } from './weatherData.js'
import { AirQualityData } from './airQualityData.js'
import { stdev } from './util.js'
import percentile from 'percentile'

export class CityWeather {
  constructor ({ latitude, longitude }) {
    this.weather = new WeatherData({
      latitude: latitude,
      longitude: longitude,
    })
    this.airQuality = new AirQualityData({
      latitude: latitude,
      longitude: longitude,
    })
  }

  async airScoreStdev () {
    await this.airQuality.fetch()
    const dailyMaxValues = this.airQuality.aqiDailyMax()
    return stdev(dailyMaxValues)
  }

  async airScore () {
    await this.airQuality.fetch()
    const dailyMaxValues = this.airQuality.aqiDailyMax()
    return dailyMaxValues.reduce((total, dailyMax) => {
      return total + dailyMax
    }, 0) / Math.max(1, dailyMaxValues.length)
  }

  async stdevTemp () {
    await this.weather.fetch()
    const temps = this.weather.dailyMeanTemp().filter((num) => {
      return !Number.isNaN(num)
    })
    return stdev(temps)
  }

  async highTemp () {
    await this.weather.fetch()
    const temps = this.weather.dailyMeanTemp().filter((num) => {
      return !Number.isNaN(num)
    })
    return percentile(90, temps)
  }

  async lowTemp () {
    await this.weather.fetch()
    const temps = this.weather.dailyMeanTemp().filter((num) => {
      return !Number.isNaN(num)
    })
    return percentile(10, temps)
  }

  async avgTemp () {
    await this.weather.fetch()
    const temps = this.weather.dailyMeanTemp().filter((num) => {
      return !Number.isNaN(num)
    })
    return temps.reduce((total, temp) => {
      return total + temp
    }, 0) / temps.length
  }

  async overcastScore() {
    const sunshineScore = await this.sunshineScore()
    return 100 - sunshineScore
  }

  async sunshineScore () {
    await this.weather.fetch()
    const sunshineDuration = this.weather.dailySunshine()
    const daylightDuration = this.weather.dailyDaylight()
    let ignoreDays = 0
    return sunshineDuration.reduce((acc, sunDuration, i) => {
      const daylight = daylightDuration[i]
      if (Number.isNaN(daylight) || Number.isNaN(sunDuration)) {
        ignoreDays++
        return acc
      }
      const sunshineIndex = daylight === 0 ? 0 : (sunDuration / daylight) * 100
      return acc + sunshineIndex
    }, 0) / Math.max(1, sunshineDuration.length - ignoreDays)
  }
}
