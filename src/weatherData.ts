import { fetchWeatherApi } from 'openmeteo'
import { START_DATE, END_DATE } from './constants.js'

// https://open-meteo.com/en/docs/historical-weather-api/
const apiUrl = "https://archive-api.open-meteo.com/v1/archive"

export class WeatherData {
  daily: any;
  args: any;

  constructor ({ latitude, longitude }: { latitude: number, longitude: number }) {
    this.daily = null;
    this.args = {
      latitude: latitude,
      longitude: longitude,
      timezone: "auto",
      start_date: START_DATE,
      end_date: END_DATE,
      daily: ["temperature_2m_max", "temperature_2m_min", "daylight_duration", "sunshine_duration"],
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
    };
  }

  dailyMaxTemp() {
    return this.daily.variables(0).valuesArray();
  }

  dailyMinTemp() {
    return this.daily.variables(1).valuesArray();
  }

  dailyDaylight() {
    return this.daily.variables(2).valuesArray();
  }

  dailySunshine() {
    return this.daily.variables(3).valuesArray();
  }

  async fetch() {
    if (this.daily) {
      console.log("Weather data already available.");
      return;
    }
    console.log("Fetching weather data...");
    try {
      const responses = await fetchWeatherApi(apiUrl, this.args);
      this.daily = responses[0].daily();
      console.log("Weather data fetched successfully.");
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }
}
