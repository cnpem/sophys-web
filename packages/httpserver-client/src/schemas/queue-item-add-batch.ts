import { z } from "zod";

const body = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      args: z.array(z.any()),
      kwargs: z.record(z.any()),
      itemType: z.string(),
    }),
  ),
  pos: z.union([z.number(), z.literal("front"), z.literal("back")]).optional(),
  beforeUid: z.string().optional(),
  afterUid: z.string().optional(),
});

const response = z.object({
  success: z.boolean(),
  msg: z.string(),
  qsize: z.number().nullable(),
  items: z.array(
    z.object({
      name: z.string(),
      args: z.array(z.any()),
      kwargs: z.record(z.any()),
      itemType: z.string(),
      user: z.string().optional(),
      userGroup: z.string().optional(),
      itemUid: z.string().optional(),
    }),
  ),
  results: z.array(
    z.object({
      success: z.boolean(),
      msg: z.string(),
    }),
  ),
});

export const schemas = {
  body,
  response,
};
