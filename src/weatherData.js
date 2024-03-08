import { fetchWeatherApi } from 'openmeteo'

// https://open-meteo.com/en/docs/historical-weather-api/
const apiUrl = "https://archive-api.open-meteo.com/v1/archive"

export class WeatherData {
  constructor ({ latitude, longitude }) {
    this.daily = null
    this.args = {
      latitude: latitude,
      longitude: longitude,
      timezone: "auto",
      start_date: "2014-03-04",
      end_date: "2024-03-05",
      daily: ["temperature_2m_mean", "daylight_duration", "sunshine_duration"],
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
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

  async fetch() {
    if (this.daily) {
      console.log("Weather data already available.")
      return
    }
    console.log("Fetching weather data...")
    try {
      const responses = await fetchWeatherApi(apiUrl, this.args)
      this.utcOffsetSeconds = responses[0].utcOffsetSeconds()
      this.daily = responses[0].daily()
      console.log("Weather data fetched successfully.")
    } catch (error) {
      console.error("Error fetching weather data:", error)
    }
  }
}
