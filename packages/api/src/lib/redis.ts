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
  });

  client.on("error", (err) => console.error("Redis Client Error", err));

  await client.connect();

  return client as RedisClientType;
};

const globalForRedis = globalThis as unknown as {
  redisClient: RedisClientType | null;
};

const redisClient = globalForRedis.redisClient ?? (await redisClientFactory());

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redisClient = redisClient;
}

export { redisClient };
