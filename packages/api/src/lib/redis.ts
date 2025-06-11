import type { RedisClientType } from "redis";
import { createClient } from "redis";
import { env } from "../../env";
import { IterableEventEmitter } from "./event-emitter";

// ---
// 0. defining default Redis options
// ---

export const redisOptions = {
  url: env.REDIS_URL || "redis://localhost:6379",
  // Additional options can be added here if needed
  redis_store_key: "sophys-app-store",
};

// ---
// 1. creating a custom IterableEventEmitter class to handle Redis keyspace events
// ---

interface RedisEventPayload {
  channel: string;
  key: string;
  message: string;
  timestamp: string;
}

export interface RedisEventMap extends Record<string, unknown> {
  event: RedisEventPayload;
}

// setting up a global event emitter for Redis keyspace events
const globalForRedisEE = globalThis as unknown as {
  redisEE?: IterableEventEmitter<RedisEventMap>;
};
export const redisEE =
  globalForRedisEE.redisEE ??
  (globalForRedisEE.redisEE = new IterableEventEmitter<RedisEventMap>());

if (env.NODE_ENV !== "production") {
  globalForRedisEE.redisEE = redisEE;
}

// ---
// 2. creating Redis clients and setting up keyspace event subscriptions
// ---
// setting up global Redis clients to avoid multiple connections
const globalForRedis = globalThis as unknown as {
  redisClient?: RedisClientType;
  redisSubscriber?: RedisClientType;
};

export const redisClient: RedisClientType =
  globalForRedis.redisClient ??
  (globalForRedis.redisClient = createClient({
    url: redisOptions.url,
  }));

export const redisSubscriber: RedisClientType =
  globalForRedis.redisSubscriber ??
  (globalForRedis.redisSubscriber = createClient({
    url: redisOptions.url,
  }));

// ---
// 3. creating a function to initialize Redis clients and subscribe to keyspace events on startup
// ---

/**
 * Converts a Redis key to a keyspace notification channel name.
 * This is used to subscribe to keyspace events for a specific key.
 *
 * @param key - The Redis key to convert.
 * @returns The corresponding keyspace notification channel.
 */
function keyToChannel(key: string): string {
  return `__keyspace@0__:${key}`;
}

/**
 * Initializes Redis global clients and sets up keyspace event subscriptions.
 * This function connects the main Redis client and the subscriber client,
 * and subscribes to keyspace events for the specified Redis store key
 * to emit events through the global event emitter.
 */
export async function initRedisClients() {
  console.log("[Redis] Initializing Redis clients if not already connected");
  if (!redisClient.isOpen) {
    console.log("[Redis] Connecting main Redis client");
    await redisClient.connect();
  }
  if (!redisSubscriber.isOpen) {
    console.log(
      "[Redis] Connecting Redis subscriber client and setting up keyspace events subscription",
    );
    await redisSubscriber.connect();
    await redisSubscriber.configSet("notify-keyspace-events", "KEA");
    console.log(
      `[Redis] Subscribing to keyspace events on key: ${redisOptions.redis_store_key}`,
    );
    await redisSubscriber.pSubscribe(
      keyToChannel(redisOptions.redis_store_key),
      (message, channel) => {
        console.log(
          `[Redis Subscriber] Keyspace event: ${message} on key: ${channel}`,
        );
        // Emit the event through the global event emitter
        redisEE.emit("event", {
          channel,
          key: redisOptions.redis_store_key,
          message,
          timestamp: new Date().toISOString(),
        });
      },
    );
  }
}
