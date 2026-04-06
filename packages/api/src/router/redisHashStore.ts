import { nanoid } from "nanoid";
import { z } from "zod";
import { env } from "../../env";
import { protectedProcedure } from "../trpc";

const redisStorePrefix = env.REDIS_STORE_PREFIX ?? "appstore";

const getAppStoreRedisKey = (storeInstanceName: string) => {
  return `${redisStorePrefix}:${storeInstanceName}`;
};

/**
 * Router for managing a HASH store instance in Redis
 * Each store instance is identified by a unique name and adds an ETag field for versioning.
 * Every set operation updates the ETag to a new unique value, which can be watched for changes and used for version control.
 */
export const redisHashStore = {
  /**  getStore retrieves the complete store object from an instance */
  getStore: protectedProcedure
    .input(
      z.object({
        storeInstanceName: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const fullRedisKey = getAppStoreRedisKey(input.storeInstanceName);
      console.log("[Redis App Store Router] getStore for key:", fullRedisKey);
      try {
        const client = ctx.redisClient;
        if (!client.isOpen) {
          throw new Error("Redis client is not connected");
        }
        const result = await client.hGetAll(fullRedisKey);
        if (Object.keys(result).length === 0) {
          return { etag: nanoid() }; // return empty store if not found, with new etag
        }
        // return object as is, but ensure it has an etag field
        return {
          etag: result.etag ?? nanoid(),
          ...result,
        };
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new Error(`Failed to get store: ${e.message}`);
        }
        throw new Error("Unknown error");
      }
    }),

  /**
   * getStoreField gets a specific field in the HASH store instance
   */
  getStoreField: protectedProcedure
    .input(
      z.object({
        storeInstanceName: z.string(),
        fieldKey: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const fullRedisKey = getAppStoreRedisKey(input.storeInstanceName);
      console.log("[Redis App Store Router] getStore for key:", fullRedisKey);
      try {
        const client = ctx.redisClient;
        if (!client.isOpen) {
          throw new Error("Redis client is not connected");
        }
        const result = await client.hGet(fullRedisKey, input.fieldKey);
        if (!result) {
          throw new Error(
            `field ${input.fieldKey} not found in ${input.storeInstanceName}`,
          );
        }
        return result;
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new Error(`Failed to get store field: ${e.message}`);
        }
        throw new Error("Unknown error");
      }
    }),

  /**
   * setStoreField sets a specific field in the HASH store instance
   */
  setStoreField: protectedProcedure
    .input(
      z.object({
        storeInstanceName: z.string(),
        fieldKey: z.string(),
        value: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fullRedisKey = getAppStoreRedisKey(input.storeInstanceName);
      console.log(
        `[Redis App Store Router] setStoreField for key: ${fullRedisKey}, field: ${input.fieldKey}`,
      );
      try {
        const client = ctx.redisClient;
        if (!client.isOpen) {
          throw new Error("Redis client is not connected");
        }
        // Update the field value and etag
        await client.hSet(fullRedisKey, {
          etag: nanoid(), // update etag on every set
          [input.fieldKey]: input.value,
        });
        return { success: true };
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new Error(`Failed to set store field: ${e.message}`);
        }
        throw new Error("Unknown error");
      }
    }),

  /** setStoreFields sets multiple fields in the HASH store instance */
  setStoreFields: protectedProcedure
    .input(
      z.object({
        storeInstanceName: z.string(),
        fields: z.array(
          z.object({
            fieldKey: z.string(),
            value: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fullRedisKey = getAppStoreRedisKey(input.storeInstanceName);
      console.log(
        `[Redis App Store Router] setStoreFields for key: ${fullRedisKey}, fields: ${input.fields
          .map((f) => f.fieldKey)
          .join(", ")}`,
      );
      try {
        const client = ctx.redisClient;
        if (!client.isOpen) {
          throw new Error("Redis client is not connected");
        }
        // Update the field value and etag
        await client.hSet(fullRedisKey, {
          etag: nanoid(), // update etag on every set
          ...input.fields.reduce(
            (acc, field) => {
              acc[field.fieldKey] = field.value;
              return acc;
            },
            {} as Record<string, string>,
          ),
        });
        return { success: true };
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new Error(`Failed to set store fields: ${e.message}`);
        }
        throw new Error("Unknown error");
      }
    }),

  /** deleteStoreField deletes a specific field from the HASH store instance */
  deleteStoreField: protectedProcedure
    .input(
      z.object({
        storeInstanceName: z.string(),
        fieldKey: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fullRedisKey = getAppStoreRedisKey(input.storeInstanceName);
      console.log(
        `[Redis App Store Router] deleteStoreField for key: ${fullRedisKey}, field: ${input.fieldKey}`,
      );
      try {
        const client = ctx.redisClient;
        if (!client.isOpen) {
          throw new Error("Redis client is not connected");
        }
        const multi = client.multi();
        multi.hDel(fullRedisKey, input.fieldKey);
        multi.hSet(fullRedisKey, "etag", nanoid());
        await multi.exec();
        return { success: true };
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new Error(`Failed to delete store field: ${e.message}`);
        }
        throw new Error("Unknown error");
      }
    }),

  /** deleteStoreInstance deletes the entire HASH store instance */
  deleteStoreInstance: protectedProcedure
    .input(
      z.object({
        storeInstanceName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fullRedisKey = getAppStoreRedisKey(input.storeInstanceName);
      console.log(
        `[Redis App Store Router] deleteStoreInstance for key: ${fullRedisKey}`,
      );
      try {
        const client = ctx.redisClient;
        if (!client.isOpen) {
          throw new Error("Redis client is not connected");
        }
        await client.del(fullRedisKey);
        return { success: true };
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new Error(`Failed to delete store instance: ${e.message}`);
        }
        throw new Error("Unknown error");
      }
    }),
} as const;
