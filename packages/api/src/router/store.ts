import { z } from "zod";
import { redisOptions } from "../lib/redis";
import { protectedProcedure } from "../trpc";

export const storeRouter = {
  hSet: protectedProcedure
    .input(
      z.object({
        value: z.record(z.string(), z.any()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const client = ctx.redis;
        await client.hSet(redisOptions.redis_store_key, input.value);
        return true;
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new Error(e.message);
        }
        throw new Error("Unknown error");
      }
    }),
  hSetField: protectedProcedure
    .input(
      z.object({
        field: z.string(),
        value: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const client = ctx.redis;
        await client.hSet(
          redisOptions.redis_store_key,
          input.field,
          input.value,
        );
        console.log(
          `Field ${input.field} for key ${redisOptions.redis_store_key} set successfully.`,
        );
        return true;
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new Error(e.message);
        }
        throw new Error("Unknown error");
      }
    }),
  hGet: protectedProcedure
    .input(
      z.object({
        field: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const client = ctx.redis;
        const result = await client.hGet(
          redisOptions.redis_store_key,
          input.field,
        );
        if (result === null) {
          console.warn(
            `Field ${input.field} for key ${redisOptions.redis_store_key} not found.`,
          );
          throw new Error(
            `Field ${input.field} for key ${redisOptions.redis_store_key} not found.`,
          );
        }
        console.log(
          `Field ${input.field} for key ${redisOptions.redis_store_key} retrieved successfully. Result: ${result}`,
        );
        return result;
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new Error(e.message);
        }
        throw new Error("Unknown error");
      }
    }),
  hGetAll: protectedProcedure.query(async ({ ctx }) => {
    console.log("hgetall");
    try {
      const client = ctx.redis;
      const result = await client.hGetAll(redisOptions.redis_store_key);
      console.log(
        `Key ${redisOptions.redis_store_key} retrieved successfully. Result:`,
        result,
      );
      if (Object.keys(result).length === 0) {
        console.warn(
          `Entry for key ${redisOptions.redis_store_key} not found.`,
        );
        throw new Error(
          `Entry for key ${redisOptions.redis_store_key} not found.`,
        );
      }
      return result;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
  hGetAll: protectedProcedure
    .input(
      z.object({
        key: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        await client.connect();
        const compoundKey = `${REDIS_STORE_PREFIX}:${input.key}`;
        const result = await client.hGetAll(compoundKey);
        console.log(`Key ${input.key} retrieved successfully. Result:`, result);
        if (Object.keys(result).length === 0) {
          console.warn(`Entry for key ${input.key} not found.`);
          await client.close();
          throw new Error(`Entry for key ${input.key} not found.`);
        }
        await client.close();
        return result;
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new Error(e.message);
        }
        throw new Error("Unknown error");
      }
    }),
} as const;
