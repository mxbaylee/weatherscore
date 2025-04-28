import { WeatherData } from './weatherData.js'
import { AirQualityData } from './airQualityData.js'
import { stdev, average } from './util.js'

interface TempScores {
  monthNumber: number;
  monthMinAverage: number;
  monthMinStdev: number;
  monthMaxAverage: number;
  monthMaxStdev: number;
}

export class CityWeather {
  weather: WeatherData;
  airQuality: AirQualityData;

  constructor ({ latitude, longitude }: { latitude: number, longitude: number }) {
    this.weather = new WeatherData({
      latitude: latitude,
      longitude: longitude,
    });
    this.airQuality = new AirQualityData({
      latitude: latitude,
      longitude: longitude,
    });
  }

  async airScoreStdev (): Promise<number> {
    await this.airQuality.fetch();
    const dailyMaxValues = this.airQuality.aqiDailyMax();
    return stdev(dailyMaxValues);
  }

  async airScore (): Promise<number> {
    await this.airQuality.fetch();
    const dailyMaxValues = this.airQuality.aqiDailyMax();
    return dailyMaxValues.reduce((total: number, dailyMax: number) => {
      return total + dailyMax;
    }, 0) / Math.max(1, dailyMaxValues.length);
  }

  async temperatureBuckets (): Promise<TempScores[]> {
    await this.weather.fetch();
    const maxTemps = this.weather.dailyMaxTemp();
    const minTemps = this.weather.dailyMinTemp();

    return Array.from({ length: 12 }, (_, month): TempScores => {
      const minValues = Object.keys(minTemps).filter((key) => {
        const date = new Date(Number(key));
        return date.getUTCMonth() === month;
      }).map((key) => {
        return minTemps[Number(key)];
      });

      const maxValues = Object.keys(maxTemps).filter((key) => {
        const date = new Date(Number(key));
        return date.getUTCMonth() === month;
      }).map((key) => {
        return maxTemps[Number(key)];
      });

      return {
        monthNumber: month + 1,
        monthMinAverage: average(minValues),
        monthMinStdev: stdev(minValues),
        monthMaxAverage: average(maxValues),
        monthMaxStdev: stdev(maxValues),
      }
    });
  }

  async overcastScore() {
    const sunshineScore = await this.sunshineScore();
    return 100 - sunshineScore;
  }

  async sunshineScore () {
    await this.weather.fetch();
    const sunshineDuration = this.weather.dailySunshine();
    const daylightDuration = this.weather.dailyDaylight();
    let ignoreDays = 0;
    return sunshineDuration.reduce((acc: number, sunDuration: number, i: number) => {
      const daylight = daylightDuration[i]
      if (Number.isNaN(daylight) || Number.isNaN(sunDuration)) {
        ignoreDays++;
        return acc;
      }
      const sunshineIndex = daylight === 0 ? 0 : (sunDuration / daylight) * 100;
      return acc + sunshineIndex;
    }, 0) / Math.max(1, sunshineDuration.length - ignoreDays);
  }
}
