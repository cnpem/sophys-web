import { z } from "zod";

const addSubmit = z.object({
  pos: z.number().optional(),
  item: z.object({
    name: z.string(),
    args: z.array(z.any()),
    kwargs: z.record(z.any()),
    itemType: z.string(),
  }),
});

const addResponse = z.object({
  success: z.boolean(),
  msg: z.string(),
  qsize: z.number(),
  item: z.object({
    name: z.string(),
    args: z.array(z.any()),
    kwargs: z.record(z.any()),
    itemType: z.string(),
  }),
});

const addBatchSubmit = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      args: z.array(z.any()),
      kwargs: z.record(z.any()),
      itemType: z.string(),
    }),
  ),
});

const addBatchResponse = z.object({
  success: z.boolean(),
  msg: z.string(),
  qsize: z.number(),
  items: z.array(
    z.object({
      name: z.string(),
      args: z.array(z.any()),
      kwargs: z.record(z.any()),
      itemType: z.string(),
      user: z.string(),
      userGroup: z.string(),
      itemUid: z.string(),
    }),
  ),
  results: z.array(
    z.object({
      success: z.literal(true),
      msg: z.string(),
    }),
  ),
});

const removeSubmit = z.object({
  uid: z.string(),
});

export default {
  addSubmit,
  addResponse,
  removeSubmit,
  addBatchSubmit,
  addBatchResponse,
};
