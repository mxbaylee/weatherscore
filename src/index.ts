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

const temperatureBuckets = await city.temperatureBuckets();

const overcastScore = await city.overcastScore();
const sunshineScore = await city.sunshineScore();

console.log({
  airScore,
  airScoreStdev,

  overcastScore,
  sunshineScore,

  ...(temperatureBuckets.reduce((acc, bucket) => {
    return {
      ...acc,
      [`month${bucket.monthNumber}MinAverage`]: bucket.monthMinAverage,
      [`month${bucket.monthNumber}MinStdev`]: bucket.monthMinStdev,
      [`month${bucket.monthNumber}MaxAverage`]: bucket.monthMaxAverage,
      [`month${bucket.monthNumber}MaxStdev`]: bucket.monthMaxStdev,
    }
  }, {})),

});

pbcopy([
  airScore,
  airScoreStdev,

  overcastScore,
  sunshineScore,

  ...Object.values(temperatureBuckets.reduce((acc, bucket) => {
    return {
      ...acc,
      [`month${bucket.monthNumber}MinAverage`]: bucket.monthMinAverage,
      [`month${bucket.monthNumber}MinStdev`]: bucket.monthMinStdev,
      [`month${bucket.monthNumber}MaxAverage`]: bucket.monthMaxAverage,
      [`month${bucket.monthNumber}MaxStdev`]: bucket.monthMaxStdev,
    }
  }, {})),

].join('\t'));
