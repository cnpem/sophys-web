import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { ConnectionTimeoutError, ErrorReply } from "redis";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

const getAppStoreRedisKey = (storeInstanceName: string) => {
  return `sophys-web-store:${storeInstanceName}`;
};

/**
 * handleRedisError is a helper function to standardize error handling for common Redis errors.
 * It logs the error and throws an appropriate TRPCError based on the type and message of the Redis error.
 */
function handleRedisError(e: unknown, contextMessage?: string): never {
  const composeMessage = (baseMessage: string) =>
    contextMessage ? `${contextMessage}: ${baseMessage}` : baseMessage;
  console.error(composeMessage("Redis error"), e);
  if (!(e instanceof Error)) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: composeMessage(`Unknown Redis error: ${String(e)}`),
    });
  }
  if (e instanceof ErrorReply) {
    if (/WRONGTYPE|unknown command/.test(e.message)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: composeMessage(`Redis command error: ${e.message}`),
      });
    }
    if (/BUSY|TRYAGAIN|LOADING/.test(e.message)) {
      throw new TRPCError({
        code: "SERVICE_UNAVAILABLE",
        message: composeMessage(`Redis command error: ${e.message}`),
      });
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: composeMessage(`Redis command error: ${e.message}`),
    });
  }
  if (e instanceof ConnectionTimeoutError) {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: composeMessage(`Redis connection timeout: ${e.message}`),
    });
  }
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: composeMessage(`Redis error: ${e.message}`),
  });
}

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
        const { etag, ...result } = await client.hGetAll(fullRedisKey);
        // if there is no etag, create a new one to ensure we always return an etag for versioning
        if (!etag) {
          console.warn(
            `ETag not found for ${input.storeInstanceName}. Generating new ETag.`,
          );
          const newEtag = nanoid();
          await client.hSet(fullRedisKey, "etag", newEtag);
          return { etag: newEtag, ...result };
        }
        // return object as is, but ensure it has an etag field
        return {
          etag: etag,
          ...result,
        };
      } catch (e) {
        handleRedisError(
          e,
          `Failed to get store for instance ${input.storeInstanceName}`,
        );
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
        handleRedisError(
          e,
          `Failed to get field ${input.fieldKey} for instance ${input.storeInstanceName}`,
        );
      }
    }),
  /** setStoreField sets a specific field in the HASH store instance */
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
        // Update the field value and etag
        await client.hSet(fullRedisKey, {
          etag: nanoid(), // update etag on every set
          [input.fieldKey]: input.value,
        });
        return true; // returns true if field was set successfully
      } catch (e) {
        handleRedisError(
          e,
          `Failed to set field ${input.fieldKey} for instance ${input.storeInstanceName}`,
        );
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
        return true; // returns true if fields were set successfully
      } catch (e) {
        handleRedisError(
          e,
          `Failed to set fields ${input.fields.map((f) => f.fieldKey).join(", ")} for instance ${input.storeInstanceName}`,
        );
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
        const multi = client
          .multi()
          .hDel(fullRedisKey, input.fieldKey)
          .hSet(fullRedisKey, "etag", nanoid());
        await multi.execTyped();
        return true; // returns true if a field was deleted
      } catch (e) {
        handleRedisError(
          e,
          `Failed to delete field ${input.fieldKey} for instance ${input.storeInstanceName}`,
        );
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
        await client.del(fullRedisKey);
        return true;
      } catch (e) {
        handleRedisError(
          e,
          `Failed to delete store instance ${input.storeInstanceName}`,
        );
      }
    }),
} as const;
