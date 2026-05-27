
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Connected'));

// Connect on module load
(async () => {
  await redisClient.connect();
})();

export default redisClient;

// Helper functions
export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
}

export async function cacheSet(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function cacheDel(key: string): Promise<void> {
  await redisClient.del(key);
}

export async function cacheIncrement(key: string): Promise<number> {
  return await redisClient.incr(key);
}