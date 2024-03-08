import { WeatherData } from './weatherData.js'

const totalDaytimeMinutes = 7200
const daytimeHourStart = 8
const daytimeHourEnd = 20

export class CityWeather {
  constructor ({ latitude, longitude, tz}) {
    if (!['pt', 'mt', 'ct', 'et'].includes(tz)) {
      throw Error('TZ not found: ' + tz)
    }
    this.tzoffset = { pt: -8, mt: -7, ct: -6, et: -5 }[tz]
    this.weather = new WeatherData({
      latitude: latitude,
      longitude: longitude,
      timezone: {
        pt: "America/Los_Angeles",
        mt: "America/Denver",
        ct: "America/Chicago",
        et: "America/New_York"
      }[tz]
    })
  }

  async overcastScore () {
    await this.weather.fetch()
    const cloudCover = this.weather.hourlyCloudCover()
    const sumDaytimeOvercastMinutes = this.weather.timeSeries().reduce((sumDaytimeOvercastMinutes, time, idx) => {
      if (this.isDaytime(time)) {
        const cloudCoverMinutes = ((cloudCover[idx] || 0) / 100) * 60
        sumDaytimeOvercastMinutes += cloudCoverMinutes
      }
      return sumDaytimeOvercastMinutes
    }, 0)
    return (sumDaytimeOvercastMinutes / this.weather.totalDays() / totalDaytimeMinutes) * 1000
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

  isDaytime (inputDate) {
    const date = new Date(inputDate.getTime())
    date.setHours(date.getHours() + this.tzoffset)
    const hour = date.getHours()
    return hour >= daytimeHourStart && hour < daytimeHourEnd
  }
}

/*
const pdx = new CityWeather({
  city: 'Portland',
  state: 'OR',
  latitude: 45.523,
  longitude: 122.676,
  tz: 'pt',
})

console.log(await pdx.overcastScore())

const weatherData = {
  hourly: {
    time: timeSeries.map((time, idx) => {
      return new Date((time + utcOffsetSeconds) * 1000)
    }).length,
    cloudCover: hourly.variables(0).valuesArray().length,
  },
  daily: {
    temperature2mMax: daily.variables(0).valuesArray(),
    temperature2mMin: daily.variables(1).valuesArray(),
    temperature2mMean: daily.variables(2).valuesArray(),
    daylightDurationS: daily.variables(3).valuesArray(),
    sunlightDurationS: daily.variables(4).valuesArray(),
  },
}

console.log(weatherData)
*/
