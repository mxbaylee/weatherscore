## 🌦️ Weather Score

Creates an overcast and sunshine score for a given lat/lng.

```
npm start -- {lat} {lng}
npm start -- 45.523 -122.676
```

```
▶ npm start -- 45.523 -122.676

> start
> node src/index.js 61.1508 -149.1091

{
  overcastScore: 37.477794024084524,
  sunshineScore: 62.522205975915476,
  avgTemp: 54.15515799646339,
  stdevTemp: 12.381727899485664,
  highTemp: 70.99324798583984,
  lowTemp: 39.00949478149414,
  airScore: 39.27823484848285,
  airScoreStdev: 18.001561639608955
}
```

## ☁️ Overcast Score

This method calculates an "overcast score" based on the hourly cloud cover data retrieved from
a weather source. The score represents the average cloud cover during daytime hours as a
percentage over a period of multiple days.

Return Values: `0` to `100`, where 100 has a lot of overcast.

## ☀️ Sunshine Score

This method calculates a "sunshine score" based on the daily sunshine duration and daylight
hours retrieved from a weather source. The score represents the average sunshine index across
multiple days, with a higher score indicating more sunshine hours.

Return Values: `0` to `100`, where 100 has a lot of sunshine.

## 🌡️ Temp's

Has methods for giving you temperature data including:

* Average Daily Temperature
* 90th Percentile
* 10th Percentile

## 🌬️ Air Quality

This function calculates an Air Quality Score based on historical hourly 
[Air Quality Index (AQI)][aqi] readings. It provides a single value representing the average of
the daily maximum AQI values over the provided data set.

Return Values: `0` to `500` where lower is better.

## 🔋 Credits

🔌 Powered by [Open Meteo](https://open-meteo.com/en/docs/historical-weather-api)

[aqi]:https://www.airnow.gov/aqi/aqi-basics/
