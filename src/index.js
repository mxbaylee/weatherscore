import { CityWeather } from './cityWeather.js'
import { pbcopy } from './util.js'

const args = process.argv.slice(2)
const latitude = parseFloat(args[0]) || 45.523
const longitude = parseFloat(args[1]) || -122.676
const tz = args[2] || 'pt'

const city = new CityWeather({
  latitude,
  longitude,
  tz,
})

const airScore = await city.airScore()
const airScoreStdev = await city.airScoreStdev()
const avgTemp = await city.avgTemp()
const stdevTemp = await city.stdevTemp()
const highTemp = await city.highTemp()
const lowTemp = await city.lowTemp()
const overcastScore = await city.overcastScore()
const sunshineScore = await city.sunshineScore()

console.log({
  overcastScore,
  sunshineScore,
  avgTemp,
  stdevTemp,
  highTemp,
  lowTemp,
  airScore,
  airScoreStdev,
})

pbcopy([
  airScore,
  airScoreStdev,
  avgTemp,
  stdevTemp,
  highTemp,
  lowTemp,
  overcastScore,
  sunshineScore,
].join('\t'))
