import { z } from "zod";

const baseItemResultSchema = z.object({
  exitStatus: z.string().optional(),
  runUids: z.array(z.string()).optional(),
  scanIds: z.array(z.coerce.number()).optional(),
  timeStart: z.number(),
  timeStop: z.number(),
  msg: z.string().optional(),
  traceback: z.string().optional(),
});

const baseItemSchema = z.object({
  name: z.string(),
  args: z.array(z.any()).optional().nullable(),
  kwargs: z.record(z.any()).optional().nullable(),
  itemType: z.string(),
  user: z.string(),
  userGroup: z.string(),
  itemUid: z.string().uuid(),
  result: baseItemResultSchema.optional().nullable(),
});

const runningItemObjectSchema = baseItemSchema.extend({
  properties: z
    .object({
      timeStart: z.number().optional(),
    })
    .optional(),
});

const itemsArraySchema = z.array(baseItemSchema);

const response = z.object({
  success: z.boolean(),
  msg: z.string(),
  items: itemsArraySchema,
  runningItem: z.preprocess((val) => {
    // If the input value is an empty object, change it to null.
    if (
      typeof val === "object" &&
      val !== null &&
      Object.keys(val).length === 0
    ) {
      return null;
    }
    // Otherwise, pass it through as is for the next validation step.
    return val;
  }, runningItemObjectSchema.nullable()), // Actual schema valitation
  planQueueUid: z.string().uuid(),
});

const body = z.object({});

export default {
  response,
  body,
};
