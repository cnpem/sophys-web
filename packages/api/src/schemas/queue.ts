import { z } from "zod";

const runningItemObjectSchema = z.object({
  name: z.string(),
  args: z.array(z.any()).optional().nullable(),
  kwargs: z.record(z.any()).optional().nullable(),
  itemType: z.string(),
  user: z.string(),
  userGroup: z.string(),
  itemUid: z.string().uuid(),
  result: z
    .object({
      exitStatus: z.string().optional(),
      runUids: z.array(z.string()).optional(),
      scanIds: z.array(z.coerce.number()).optional(),
      timeStart: z.number(),
      timeStop: z.number(),
      msg: z.string().optional(),
      traceback: z.string().optional(),
    })
    .optional()
    .nullable(),
  properties: z.object({}).passthrough().optional(),
});

const getResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      args: z.array(z.any()).optional().nullable(),
      kwargs: z.record(z.any()).optional().nullable(),
      itemType: z.string(),
      user: z.string(),
      userGroup: z.string(),
      itemUid: z.string().uuid(),
      result: z
        .object({
          exitStatus: z.string().optional(),
          runUids: z.array(z.string()).optional(),
          scanIds: z.array(z.coerce.number()).optional(),
          timeStart: z.number(),
          timeStop: z.number(),
          msg: z.string().optional(),
          traceback: z.string().optional(),
        })
        .optional()
        .nullable(),
    }),
  ),
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

export default { getResponseSchema };
