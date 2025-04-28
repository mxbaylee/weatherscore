import { OpenMeteoApi, DailyResponse, TimeSeriesPairs } from './openMeteoApi'

export class WeatherData {
  private daily: DailyResponse | null;
  private api: OpenMeteoApi;
  private latitude: number;
  private longitude: number;

  constructor ({ latitude, longitude }: { latitude: number, longitude: number }) {
    this.daily = null;
    this.api = new OpenMeteoApi();
    this.latitude = latitude;
    this.longitude = longitude;
  }

  dailyMaxTemp(): TimeSeriesPairs {
    if (!this.daily) {
      throw new Error('Daily data not available. Call fetch() first.');
    }
    return this.daily.temperature_2m_max.pairs;
  }

  dailyMinTemp(): TimeSeriesPairs {
    if (!this.daily) {
      throw new Error('Daily data not available. Call fetch() first.');
    }
    return this.daily.temperature_2m_min.pairs;
  }

  dailyDaylight(): number[] {
    if (!this.daily) {
      throw new Error('Daily data not available. Call fetch() first.');
    }
    return this.daily.daylight_duration.values;
  }

  dailySunshine(): number[] {
    if (!this.daily) {
      throw new Error('Daily data not available. Call fetch() first.');
    }
    return this.daily.sunshine_duration.values;
  }

  async fetch() {
    if (this.daily) {
      console.log("Weather data already available.");
      return;
    }
    console.log("Fetching weather data...");
    try {
      this.daily = await this.api.fetchDailyWeather({
        latitude: this.latitude,
        longitude: this.longitude,
      });
      console.log("Weather data fetched successfully.");
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }
}
