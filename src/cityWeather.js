import { WeatherData } from './weatherData.js'
import { AirQualityData } from './airQualityData.js'
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

  async airScore () {
    await this.airQuality.fetch()

    // Each day is in their own sub-array
    const dailyValues = this.airQuality.aqi().reduce((buckets, aqi) => {
      const lastBucket = buckets[buckets.length - 1]
      if (lastBucket.length === 24) {
        buckets.push([aqi])
      } else {
        buckets[buckets.length - 1].push(aqi)
      }
      return buckets
    }, [[]])

    // Adds the max of each bucket and averages them
    let ignoreDays = 0
    const dailyAverage = dailyValues.reduce((total, dayBucket) => {
      let dailyMax = Math.max(...dayBucket.filter(x => !isNaN(x)))
      if (dailyMax < 0 || dailyMax > 500) {
        dailyMax = 0
        ignoreDays++
      }
      return total + dailyMax
    }, 0) / Math.max(1, dailyValues.length - ignoreDays)

    return dailyAverage
  }

  async stdevTemp () {
    await this.weather.fetch()
    const temps = this.weather.dailyMeanTemp().filter((num) => {
      return !Number.isNaN(num)
    })
    const avg = temps.reduce((total, temp) => {
      return total + temp
    }, 0) / temps.length
    const variance = temps.reduce((acc, temp) => {
      return acc + Math.pow(temp - avg, 2)
    }, 0) / (temps.length - 1)
    return Math.sqrt(variance)
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
