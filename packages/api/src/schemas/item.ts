import { z } from "zod";

const addSubmit = z.object({
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

const addResponse = z.object({
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

const addBatchSubmit = z.object({
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

const addBatchResponse = z.object({
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

const removeSubmit = z.object({
  uid: z.string(),
});

const updateSubmit = z.object({
  item: z.object({
    itemUid: z.string(),
    ...addSubmit.shape.item.shape,
  }),
});

const updateResponse = addResponse;

const moveSubmit = z.object({
  pos: z.union([z.number(), z.literal("front"), z.literal("back")]).optional(),
  uid: z.string().optional(),
  posDest: z
    .union([z.number(), z.literal("front"), z.literal("back")])
    .optional(),
  beforeUid: z.string().optional(),
  afterUid: z.string().optional(),
});

const moveResponse = z.object({
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
  addSubmit,
  addResponse,
  removeSubmit,
  addBatchSubmit,
  addBatchResponse,
  updateSubmit,
  updateResponse,
  moveSubmit,
  moveResponse,
};
