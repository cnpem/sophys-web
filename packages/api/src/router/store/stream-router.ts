import { protectedProcedure } from "../../trpc";

export const streamRouter = {
  onKeyspaceEvents: protectedProcedure.subscription(async function* ({ ctx }) {
    // This subscription listens for Redis keyspace events and yields them as they come in.
    const { redisEE } = ctx;
    console.log("[API] Subscribing to Redis keyspace events...");
    for await (const [payload] of redisEE.toIterable("event")) {
      console.log(
        "[API] yielding keyspace event:",
        payload.message,
        "on key:",
        payload.key,
        "at",
        payload.timestamp,
      );
      yield payload.message;
    }
    // Cleanup is handled automatically by the subscription system when the client disconnects
    console.log("Redis keyspace event subscription cleaned up.");
  }),
} as const;
