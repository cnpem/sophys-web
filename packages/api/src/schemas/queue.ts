import { z } from "zod";

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
          runUids: z.array(z.string()),
          scanIds: z.array(z.string()),
          timeStart: z.number(),
          timeStop: z.number(),
          msg: z.string().optional(),
          traceback: z.string().optional(),
        })
        .optional()
        .nullable(),
    }),
  ),
  runningItem: z
    .object({
      name: z.string().optional(),
      args: z.array(z.any()).optional(),
      kwargs: z.record(z.any()).optional().nullable(),
      itemType: z.string().optional(),
      user: z.string().optional(),
      userGroup: z.string().optional(),
      itemUid: z.string().optional(),
      properties: z.object({}).passthrough().optional(),
      result: z
        .object({
          exitStatus: z.string().optional(),
          runUids: z.array(z.string()).optional(),
          scanIds: z.array(z.string()).optional(),
          timeStart: z.number().optional(),
          timeStop: z.number().optional(),
          msg: z.string().optional(),
          traceback: z.string().optional(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
  planQueueUid: z.string().uuid(),
});

export default { getResponseSchema };
