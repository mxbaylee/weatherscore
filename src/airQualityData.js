import { fetchWeatherApi } from 'openmeteo'

// https://open-meteo.com/en/docs/air-quality-api/
const apiUrl = "https://air-quality-api.open-meteo.com/v1/air-quality"

export class AirQualityData {
  constructor ({ latitude, longitude }) {
    this.hourly = null
    this.args = {
      latitude: latitude,
      longitude: longitude,
      hourly: ["us_aqi"],
      timezone: "auto",
      start_date: "2022-07-29",
      end_date: "2024-03-05",
    }
  }

  aqi () {
    return this.hourly.variables(0).valuesArray()
  }

  async fetch() {
    if (this.hourly) {
      console.log("Air Quality data already available.")
      return
    }
    console.log("Fetching Air Quality data...")
    try {
      const responses = await fetchWeatherApi(apiUrl, this.args)
      this.utcOffsetSeconds = responses[0].utcOffsetSeconds()
      this.hourly = responses[0].hourly()
      console.log("Air Quality data fetched successfully.")
    } catch (error) {
      console.error("Error fetching Air Quality data:", error)
    }
  }
}
