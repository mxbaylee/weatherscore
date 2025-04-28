import { fetchWeatherApi } from 'openmeteo'
import { START_DATE, END_DATE } from './constants'
import type { WeatherApiResponse } from '@openmeteo/sdk/weather-api-response'
import type { VariablesWithTime } from '@openmeteo/sdk/variables-with-time'
import { readCacheOrFetch } from './cache'

export const API_URLS = {
  weather: "https://archive-api.open-meteo.com/v1/archive",
  airQuality: "https://air-quality-api.open-meteo.com/v1/air-quality"
}

export interface WeatherParams {
  latitude: number;
  longitude: number;
  timezone?: string;
  startDate?: string;
  endDate?: string;
}

export interface TimeSeriesPairs {
  [utcMs: number]: Float32Array[number];
}

export interface TimeSeriesData {
  values: number[];
  utcMs: number[];
  pairs: TimeSeriesPairs;
}

export type FetchParams = Record<string, string[]|string|number>;

export interface HourlyResponse {
  [variableName: string]: TimeSeriesData;
}

export interface DailyResponse {
  [variableName: string]: TimeSeriesData;
}

export class OpenMeteoApi {
  private async fetchRaw(url: string, params: FetchParams): Promise<WeatherApiResponse> {
    try {
      const responses = await fetchWeatherApi(url, params);
      return responses[0];
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error)
      throw error;
    }
  }

  private buildTimeSeriesData(variableResponse: VariablesWithTime, utcOffset: number): TimeSeriesData[] {
    const start = Number(variableResponse.time());
    const end = Number(variableResponse.timeEnd());
    const step = variableResponse.interval();
    const totalVariables = variableResponse.variablesLength();
    const valuesArrays = Array.from({ length: totalVariables }, (_, i): Float32Array => {
      return variableResponse.variables(i)?.valuesArray() || new Float32Array();
    });

    const utcMs = Array.from({ length: (end - start) / step }, (_, i) => {
      const time = start + i * step;
      return (time + utcOffset) * 1000;
    });

    return valuesArrays.map((values: Float32Array) => ({
      values: Array.from(values),
      utcMs,
      pairs: Object.fromEntries(utcMs.map((utcMs, idx) => [utcMs, values[idx]]))
    }));
  }

  async fetchDailyWeather({ latitude, longitude, timezone, startDate, endDate }: WeatherParams): Promise<DailyResponse> {
    const params: FetchParams = {
      latitude,
      longitude,
      start_date: startDate || START_DATE,
      end_date: endDate || END_DATE,
      timezone: timezone || "auto",
      daily: ["temperature_2m_max", "temperature_2m_min", "daylight_duration", "sunshine_duration"],
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
    };

    const cacheKey = `daily-weather_${params.latitude}_${params.longitude}_${params.start_date}_${params.end_date}`;

    const [
      temperature_2m_max,
      temperature_2m_min,
      daylight_duration,
      sunshine_duration
    ] = await readCacheOrFetch(cacheKey, async (): Promise<TimeSeriesData[]> => {
      const response = await this.fetchRaw(API_URLS.weather, params);
      const daily = response.daily();

      if (!daily) {
        console.warn("No daily data available");
        console.warn(params);
        return [];
      }

      return this.buildTimeSeriesData(daily, response.utcOffsetSeconds());
    });

    return {
      temperature_2m_max,
      temperature_2m_min,
      daylight_duration,
      sunshine_duration
    };
  }

  async fetchHourlyAirQuality({ latitude, longitude, timezone, startDate, endDate }: WeatherParams): Promise<HourlyResponse> {
    const params: FetchParams = {
      latitude,
      longitude,
      start_date: startDate || START_DATE,
      end_date: endDate || END_DATE,
      timezone: timezone || "auto",
      hourly: ["us_aqi"],
    };

    const cacheKey = `hourly-air-quality_${params.latitude}_${params.longitude}_${params.start_date}_${params.end_date}`;
    const [us_aqi] = await readCacheOrFetch(cacheKey, async (): Promise<TimeSeriesData[]> => {
      const response = await this.fetchRaw(API_URLS.airQuality, params);

      const hourly = response.hourly();

      if (!hourly) {
        console.warn("No hourly data available");
        console.warn(params);
        return [];
      }

      return this.buildTimeSeriesData(hourly, response.utcOffsetSeconds());
    });

    return {
      us_aqi
    };
  }
}
