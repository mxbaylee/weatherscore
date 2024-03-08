import { fetchWeatherApi } from 'openmeteo'

const apiUrl = "https://archive-api.open-meteo.com/v1/archive"

export class WeatherData {
  constructor ({ latitude, longitude, timezone }) {
    this.hourly = null
    this.daily = null
    this.args = {
      "latitude": latitude,
      "longitude": longitude,
      "timezone": timezone,
      "start_date": "2024-03-04",
      "end_date": "2024-03-05",
      "hourly": ["cloud_cover"],
      "daily": ["temperature_2m_mean", "daylight_duration", "sunshine_duration"],
      "temperature_unit": "fahrenheit",
      "wind_speed_unit": "mph",
    }
  }

  dailyMeanTemp() {
    return this.daily.variables(0).valuesArray()
  }

  dailyDaylight() {
    return this.daily.variables(1).valuesArray()
  }

  dailySunshine() {
    return this.daily.variables(2).valuesArray()
  }

  hourlyCloudCover() {
    return this.hourly.variables(0).valuesArray()
  }

  totalDays() {
    return this.timeSeries().reduce((daySet, datetime) => {
      const millisecondsInDay = 1000 * 60 * 60 * 24
      const dayNumber = Math.floor(datetime.getTime() / millisecondsInDay)
      daySet.add(dayNumber)
      return daySet
    }, new Set()).size
  }

  timeSeries() {
    const startTime = Number(this.hourly.time())
    const endTime = Number(this.hourly.timeEnd())
    const interval = this.hourly.interval()
    const length = Math.floor((endTime - startTime) / interval)

    return Array.from({ length }, (_, i) => {
      const time = startTime + i * interval
      return new Date((time + this.utcOffsetSeconds) * 1000)
    })
  }

  async fetch() {
    if (this.hourly) {
      console.log("Weather data already available.")
      return
    }
    console.log("Fetching weather data...")
    try {
      const responses = await fetchWeatherApi(apiUrl, this.args)
      this.utcOffsetSeconds = responses[0].utcOffsetSeconds()
      this.hourly = responses[0].hourly()
      this.daily = responses[0].daily()
      console.log("Weather data fetched successfully.")
    } catch (error) {
      console.error("Error fetching weather data:", error)
    }
  }
}
