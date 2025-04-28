import { mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const CACHE_DIR = join(process.cwd(), '.cache');

export async function readCacheOrFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Ensure cache directory exists
  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, { recursive: true });
  }

  const cachePath = join(CACHE_DIR, `${cacheKey}.json`);

  // Try to read from cache
  if (existsSync(cachePath)) {
    try {
      const cachedData = await readFile(cachePath, 'utf-8');
      const { data } = JSON.parse(cachedData);
      console.log('Cache hit', cachePath);
      return data;
    } catch (error) {
      console.warn('Error reading cache:', error);
    }
  }

  // Fetch new data
  console.log('Cache miss', cachePath);
  const data = await fetchFn();

  // Write to cache
  try {
    await writeFile(
      cachePath,
      JSON.stringify({
        data
      }, null, 2)
    );
  } catch (error) {
    console.warn('Error writing to cache:', error);
  }

  return data;
}
