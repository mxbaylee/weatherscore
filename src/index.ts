import { CityWeather } from './cityWeather'
import { pbcopy } from './util'

const args = process.argv.slice(2);
const latitude = parseFloat(args[0]) || 45.523;
const longitude = parseFloat(args[1]) || -122.676;

const city = new CityWeather({
  latitude,
  longitude,
});

const airScore = await city.airScore();
const airScoreStdev = await city.airScoreStdev();

const avgMaxTemp = await city.avgMaxTemp();
const stdevMaxTemp = await city.stdevMaxTemp();
const avgMinTemp = await city.avgMinTemp();
const stdevMinTemp = await city.stdevMinTemp();

const overcastScore = await city.overcastScore();
const sunshineScore = await city.sunshineScore();

console.log({
  airScore,
  airScoreStdev,

  avgMaxTemp,
  stdevMaxTemp,
  avgMinTemp,
  stdevMinTemp,

  overcastScore,
  sunshineScore,
});

pbcopy([
  airScore,
  airScoreStdev,

  avgMaxTemp,
  stdevMaxTemp,
  avgMinTemp,
  stdevMinTemp,

  overcastScore,
  sunshineScore,
].join('\t'));
