import { z } from "zod";

const response = z.object({
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
      result: z.object({
        exitStatus: z.string().optional(),
        runUids: z.array(z.string()).optional(),
        scanIds: z.array(z.coerce.number()).optional(),
        timeStart: z.number(),
        timeStop: z.number(),
        msg: z.string().optional(),
        traceback: z.string().optional(),
      }),
    }),
  ),
  planHistoryUid: z.string().uuid(),
});

const body = z.object({});

export default {
  response,
  body,
};
