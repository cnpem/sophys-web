import { z } from "zod";
import { redisOptions } from "../../lib/redis";
import { protectedProcedure } from "../../trpc";

/**
 * A type representing a JSON-compatible value in Redis based on the RedisJSON module
 * and json.set/get commands signature.
 */
export type RedisJSONcompat =
  | null
  | boolean
  | number
  | string
  | Date
  | RedisJSONArrayCompat
  | RedisJSONObjectCompat;
type RedisJSONArrayCompat = RedisJSONcompat[];
interface RedisJSONObjectCompat {
  [key: string]: RedisJSONcompat;
}

/**
 * A Zod schema for validating JSON-compatible values in Redis.
 * This schema is used to ensure that the values passed to json.set are compatible with RedisJSON.
 */
const redisJSONcompatible: z.ZodType<RedisJSONcompat> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.date(),
    z.array(redisJSONcompatible),
    z.record(redisJSONcompatible),
  ]),
);

/**
 * A router for handling Redis client.json operations.
 *
 * */
export const jsonRouter = {
  set: protectedProcedure
    .input(
      z.object({
        // accept only named paths, e.g. "user" or "user.name"
        // and not wildcard paths like "*" and "$"
        // this is to prevent accidental overwrites of the entire JSON document
        // and to ensure that the path is valid for RedisJSON
        path: z
          .string()
          .refine(
            (val) => {
              return !val.startsWith("$") && !val.includes("*");
            },
            {
              message: "Invalid path. Must not start with '$' or contain '*'.",
            },
          )
          .transform((val) => `$.${val}`), // add a leading $ to the path repesenting the root
        value: redisJSONcompatible,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const client = ctx.redis;
        await client.json.set(
          redisOptions.redis_store_key,
          input.path,
          input.value,
        );
        console.log(`JSON set at path ${input.path} successfully.`);
        return true;
      } catch (e) {
        if (e instanceof Error) {
          console.error(e);
          throw new Error(e.message);
        }
        throw new Error("Unknown error");
      }
    }),
  get: protectedProcedure
    .input(
      z.object({
        path: z
          .string()
          .optional()
          .default("$")
          .transform((val) => {
            // Default path is the root of the JSON document
            return val.startsWith("$") ? val : `$.${val}`;
          }),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const client = ctx.redis;
        const result = await client.json.get(redisOptions.redis_store_key, {
          path: input.path,
        });
        if (result === null) {
          console.warn(`JSON at path ${input.path} not found.`);
          throw new Error(`JSON at path ${input.path} not found.`);
        }
        console.log(
          `JSON retrieved at path ${input.path} successfully. Result:`,
          result,
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
} as const;
