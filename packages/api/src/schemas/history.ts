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
  planHistoryUid: z.string().uuid(),
});

export default { getResponseSchema };
