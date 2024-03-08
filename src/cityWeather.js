import { WeatherData } from './weatherData.js'

export class CityWeather {
  constructor ({ latitude, longitude }) {
    this.weather = new WeatherData({
      latitude: latitude,
      longitude: longitude,
    })
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
