import type { RedisClientType } from "redis";
import { createClient } from "redis";
import { env } from "../../env";
import { createAsyncClientFactory } from "./singleton-factory";

const redisFactory = async (): Promise<RedisClientType | null> => {
  const redisUrl = env.REDIS_URL;

  if (!redisUrl) {
    console.warn("REDIS_URL is not defined. Redis client will not be created.");
    return null;
  }

  const client = createClient({ url: redisUrl }) as RedisClientType;
  client.on("error", (err) => console.error("Redis Client Error", err));
  await client.connect();

  return client;
};

export const getRedisClient = createAsyncClientFactory(redisFactory, "Redis");
