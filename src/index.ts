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
console.log({ airScore });
process.exit(0);
const airScoreStdev = await city.airScoreStdev();

const temperatureBuckets = await city.temperatureBuckets();

const overcastScore = await city.overcastScore();
const sunshineScore = await city.sunshineScore();

console.log({
  airScore,
  airScoreStdev,

  temperatureBuckets,

  overcastScore,
  sunshineScore,
});

pbcopy([
  airScore,
  airScoreStdev,

  temperatureBuckets,

  overcastScore,
  sunshineScore,
].join('\t'));
