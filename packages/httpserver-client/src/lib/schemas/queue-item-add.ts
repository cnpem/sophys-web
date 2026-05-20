import { z } from "zod";

const body = z.object({
  pos: z.union([z.number(), z.literal("front"), z.literal("back")]).optional(),
  item: z.object({
    name: z.string(),
    args: z.array(z.any()),
    kwargs: z.record(z.any()),
    itemType: z.string(),
  }),
  beforeUid: z.string().optional(),
  afterUid: z.string().optional(),
});

const response = z.object({
  success: z.boolean(),
  msg: z.string(),
  qsize: z.number().nullable(),
  item: z.object({
    name: z.string(),
    args: z.array(z.any()),
    kwargs: z.record(z.any()),
    itemType: z.string(),
  }),
});

export default {
  body,
  response,
};
