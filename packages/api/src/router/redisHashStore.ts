import { TRPCError } from "@trpc/server";
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
        const { etag, ...result } = await client.hGetAll(fullRedisKey);
        if (Object.keys(result).length === 0) {
          return { etag: nanoid() }; // return empty store if not found, with new etag
        }
        // if there is no etag, create a new one to ensure we always return an etag for versioning
        if (!etag) {
          console.warn(
            `ETag not found for ${input.storeInstanceName}. Generating new ETag.`,
          );
          const newEtag = nanoid();
          const setResult = await client.hSet(fullRedisKey, "etag", newEtag);
          if (setResult === 0) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to set new ETag for store instance`,
            });
          }
          return { etag: newEtag, ...result };
        }
        // return object as is, but ensure it has an etag field
        return {
          etag: etag,
          ...result,
        };
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to get store: ${e.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unknown error",
        });
      }
    }),

  /**
   * getStoreField gets a specific field in the HASH store instance
   * Returns the field value and the current ETag of the store for versioning purposes
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
        const [etag, value] = await client.hmGet(fullRedisKey, [
          "etag",
          input.fieldKey,
        ]);
        // if there is no etag, create a new one to ensure we always return an etag for versioning
        if (!etag) {
          console.warn(
            `ETag not found for ${input.storeInstanceName}, field ${input.fieldKey}. Generating new ETag.`,
          );
          const newEtag = nanoid();
          await client.hSet(fullRedisKey, "etag", newEtag);
          return { etag: newEtag, value: value };
        }
        return { etag: etag, value: value };
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to get store field: ${e.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unknown error",
        });
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
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to set store field: ${e.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unknown error",
        });
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
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to set store fields: ${e.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unknown error",
        });
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
        const multi = client
          .multi()
          .hDel(fullRedisKey, input.fieldKey)
          .hSet(fullRedisKey, "etag", nanoid());
        const [delResult, setResult] = await multi.execTyped();
        if (delResult === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Field not found in store instance`,
          });
        }
        if (setResult === 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update ETag after deleting field`,
          });
        }
        return true; // returns true if a field was deleted
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to delete store field: ${e.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unknown error",
        });
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
        const result = await client.del(fullRedisKey);
        return result === 1; // returns true if a key was deleted
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to delete store instance: ${e.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unknown error",
        });
      }
    }),
} as const;
