import { CityWeather } from './cityWeather.js'
import { spawn } from 'child_process'

const args = process.argv.slice(2)
const latitude = parseFloat(args[0]) || 45.523
const longitude = parseFloat(args[1]) || -122.676
const tz = args[2] || 'pt'

const city = new CityWeather({
  latitude,
  longitude,
  tz,
})

const avgTemp = await city.avgTemp()
const highTemp = await city.highTemp()
const lowTemp = await city.lowTemp()
const overcastScore = await city.overcastScore()
const sunshineScore = await city.sunshineScore()

console.log('Avg Temp', avgTemp)
console.log('High Temp', highTemp)
console.log('Low Temp', lowTemp)
console.log('Overcast Score', overcastScore)
console.log('Sunshine Score', sunshineScore)

function pbcopy (data) {
  const proc = spawn('pbcopy')
  proc.stdin.write(data)
  proc.stdin.end()
}

pbcopy(`${avgTemp}\t${highTemp}\t${lowTemp}\t${overcastScore}\t${sunshineScore}`);
