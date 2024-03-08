import { CityWeather } from './cityWeather.js'

const pdx = new CityWeather({
  city: 'Portland',
  state: 'OR',
  latitude: 45.523,
  longitude: -122.676,
  tz: 'pt',
})

console.log('Overcast Score', await pdx.overcastScore())
console.log('Avg Temp', await pdx.avgTemp())
console.log('Sunshine Score', await pdx.sunshineScore())
