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

export default {
  addSubmit,
  addResponse,
};
