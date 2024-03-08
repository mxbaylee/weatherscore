## 🌦️ Weather Score

Creates an overcast and sunshine score for a given lat/lng.

```
npm start -- 45.523 -122.676 pt
```

### Format

```
npm start -- {lat} {lng} {tz}
```

`tz` - Can be 'pt', 'mt', 'ct', 'et', 'at', 'ht'

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

## 🌡️ Avg Temp

Returns the average daily temperature of all daily temperatures in fahrenheit.

## 🤭 Timezones

Timezone support is limited, with a hand-wavey approach which does effect accuracy.
