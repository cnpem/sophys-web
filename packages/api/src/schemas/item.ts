import { z } from "zod";

const addSubmit = z
  .object({
    pos: z.number().optional(),
    item: z.object({
      name: z.string(),
      args: z.array(z.any()),
      kwargs: z.record(z.any()),
      itemType: z.string(),
    }),
  })
  .transform((data) => {
    const {
      item: { itemType, ...unchanged },
      pos,
    } = data;
    return {
      item: {
        item_type: itemType,
        ...unchanged,
      },
      pos,
    };
  });

const addResponse = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true) }),
  z.object({
    success: z.literal(false),
    msg: z.string(),
    qsize: z.number().nullable(),
    item: z
      .object({
        name: z.string(),
        args: z.array(z.any()),
        kwargs: z.record(z.any()),
        item_type: z.string(),
      })
      .transform((data) => {
        const { item_type, ...unchanged } = data;
        return {
          itemType: item_type,
          ...unchanged,
        };
      }),
  }),
]);

const addBatchSubmit = z
  .object({
    items: z.array(
      z.object({
        name: z.string(),
        args: z.array(z.any()),
        kwargs: z.record(z.any()),
        itemType: z.string(),
      }),
    ),
  })
  .transform((data) => {
    return {
      items: data.items.map(({ itemType, ...unchanged }) => ({
        item_type: itemType,
        ...unchanged,
      })),
    };
  });

const addBatchResponse = z
  .object({
    success: z.literal(true),
    msg: z.string(),
    qsize: z.number(),
    items: z.array(
      z.object({
        name: z.string(),
        args: z.array(z.any()),
        kwargs: z.record(z.any()),
        item_type: z.string(),
        user: z.string(),
        user_group: z.string(),
        item_uid: z.string(),
      }),
    ),
    results: z.array(
      z.object({
        success: z.literal(true),
        msg: z.string(),
      }),
    ),
  })
  .transform((data) => {
    return {
      ...data,
      items: data.items.map(
        ({ item_type, user_group, item_uid, ...unchanged }) => ({
          itemType: item_type,
          userGroup: user_group,
          itemUid: item_uid,
          ...unchanged,
        }),
      ),
    };
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
