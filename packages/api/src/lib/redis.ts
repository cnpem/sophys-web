import type { RedisClientType } from "redis";
import { createClient } from "redis";
import { env } from "../../env";

const redisClientFactory = async (): Promise<RedisClientType> => {
  const redisUrl = env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL is not defined in environment variables");
  }

  const client = createClient({
    url: redisUrl,
  }) as RedisClientType;

  client.on("error", (err) => console.error("Redis Client Error", err));

  await client.connect();

  return client;
};

let redisClientPromise: Promise<RedisClientType> | null = null;

const getRedisClient = async (): Promise<RedisClientType> => {
  redisClientPromise ??= redisClientFactory();
  return redisClientPromise;
};

export { getRedisClient };
