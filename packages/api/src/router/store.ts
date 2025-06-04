import { createClient } from "redis";
import { z } from "zod";
import { env } from "../../env";
import { protectedProcedure } from "../trpc";

const REDIS_STORE_PREFIX = "redis-store";

const client = createClient({
  url: env.REDIS_URL,
});

export const storeRouter = {
  get: protectedProcedure
    .input(
      z.object({
        key: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        await client.connect();
        const compoundKey = `${REDIS_STORE_PREFIX}:${input.key}`;
        const result = await client.get(compoundKey);
        if (!result) {
          // console.log(`Key ${input.key} does not exist.`);
          console.warn(`Key ${input.key} does not exist.`);
          throw new Error(`Key ${input.key} does not exist.`);
        }
        console.log(
          `Key ${input.key} retrieved successfully. Result: ${result}`,
        );
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
  set: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await client.connect();
        const compoundKey = `${REDIS_STORE_PREFIX}:${input.key}`;
        await client.set(compoundKey, input.value);
        await client.close();
        return true;
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new Error(e.message);
        }
        throw new Error("Unknown error");
      }
    }),
  del: protectedProcedure
    .input(
      z.object({
        key: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await client.connect();
        const compoundKey = `${REDIS_STORE_PREFIX}:${input.key}`;
        const result = await client.del(compoundKey);
        await client.close();
        if (result === 0) {
          console.log(`Key ${input.key} does not exist.`);
          return false;
        }
        return true;
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new Error(e.message);
        }
        throw new Error("Unknown error");
      }
    }),
  hSet: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.record(z.string(), z.any()),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await client.connect();
        const compoundKey = `${REDIS_STORE_PREFIX}:${input.key}`;
        await client.hSet(compoundKey, input.value);
        await client.close();
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
        key: z.string(),
        field: z.string(),
        value: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await client.connect();
        const compoundKey = `${REDIS_STORE_PREFIX}:${input.key}`;
        await client.hSet(compoundKey, input.field, input.value);
        console.log(
          `Field ${input.field} for key ${input.key} set successfully.`,
        );
        await client.close();
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
        key: z.string(),
        field: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        await client.connect();
        const compoundKey = `${REDIS_STORE_PREFIX}:${input.key}`;
        const result = await client.hGet(compoundKey, input.field);
        if (result === null) {
          console.warn(`Field ${input.field} for key ${input.key} not found.`);
          await client.close();
          throw new Error(
            `Field ${input.field} for key ${input.key} not found.`,
          );
        }
        console.log(
          `Field ${input.field} for key ${input.key} retrieved successfully. Result: ${result}`,
        );
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
