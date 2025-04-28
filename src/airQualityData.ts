import { HourlyResponse, OpenMeteoApi } from './openMeteoApi';

const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

export class AirQualityData {
  private hourly: HourlyResponse | null;
  private api: OpenMeteoApi;
  private latitude: number;
  private longitude: number;

  constructor ({ latitude, longitude }: { latitude: number, longitude: number }) {
    this.hourly = null;
    this.api = new OpenMeteoApi();
    this.latitude = latitude;
    this.longitude = longitude;
  }

  // lower is better
  aqi (): number[] {
    if (!this.hourly) {
      throw new Error('Hourly data not available. Call fetch() first.');
    }
    return this.hourly.us_aqi.values;
  }

  aqiDailyMax (): number[] {
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
      return Math.max(...dayBucket.filter((x: number) => x !== null && !isNaN(x)));
    }).filter((dailyMax: number) => {
      return Number.isFinite(dailyMax) && !isNaN(dailyMax);
    });
  }

  async fetch(): Promise<void> {
    if (this.hourly) {
      console.log("Air Quality data already available.");
      return;
    }
    console.log("Fetching Air Quality data...");
    try {
      this.hourly = await this.api.fetchHourlyAirQuality({
        latitude: this.latitude,
        longitude: this.longitude,
      });
      console.log("Air Quality data fetched successfully.");
    } catch (error) {
      console.error("Error fetching Air Quality data:", error);
    }
  }
}
