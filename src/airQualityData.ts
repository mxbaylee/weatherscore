import { fetchWeatherApi } from 'openmeteo'
import { START_DATE, END_DATE } from './constants.js'

// https://open-meteo.com/en/docs/air-quality-api/
const apiUrl = "https://air-quality-api.open-meteo.com/v1/air-quality"

export class AirQualityData {
  hourly: any;
  args: any;

  constructor ({ latitude, longitude }: { latitude: number, longitude: number }) {
    this.hourly = null;
    this.args = {
      latitude: latitude,
      longitude: longitude,
      hourly: ["us_aqi"],
      timezone: "auto",
      start_date: START_DATE,
      end_date: END_DATE,
    };
  }

  aqi () {
    return this.hourly.variables(0).valuesArray();
  }

  aqiDailyMax () {
    // Turn them into dailiy buckets
    const dailyValues: number[][] = this.aqi().reduce((buckets: number[][], aqi: number) => {
      const lastBucket = buckets[buckets.length - 1];
      if (lastBucket.length === 24) {
        buckets.push([aqi]);
      } else {
        buckets[buckets.length - 1].push(aqi);
      }
      return buckets;
    }, [[]])
    // Map to daily max values
    return dailyValues.map((dayBucket: number[]) => {
      return Math.max(...dayBucket.filter((x: number) => !isNaN(x)));
    }).filter((dailyMax: number) => {
      return Number.isFinite(dailyMax) && !isNaN(dailyMax);
    });
  }

  async fetch() {
    if (this.hourly) {
      console.log("Air Quality data already available.");
      return;
    }
    console.log("Fetching Air Quality data...");
    try {
      const responses = await fetchWeatherApi(apiUrl, this.args);
      this.hourly = responses[0].hourly();
      console.log("Air Quality data fetched successfully.");
    } catch (error) {
      console.error("Error fetching Air Quality data:", error);
    }
  }
}
