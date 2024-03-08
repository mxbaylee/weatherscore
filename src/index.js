import { CityWeather } from './cityWeather.js'

const args = process.argv.slice(2)
const latitude = parseFloat(args[0]) || 45.523
const longitude = parseFloat(args[1]) || -122.676
const tz = args[2] || 'pt'

const pdx = new CityWeather({
  latitude,
  longitude,
  tz,
})

console.log('Overcast Score', await pdx.overcastScore())
console.log('Avg Temp', await pdx.avgTemp())
console.log('Sunshine Score', await pdx.sunshineScore())
