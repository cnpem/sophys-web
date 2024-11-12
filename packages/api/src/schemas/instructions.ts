import { z } from "zod";

export const AVAILABLE_INSTRUCTIONS = ["queue_stop"] as const;

const queueStop = z
  .object({
    item_type: z.literal("instruction"),
    instruction: z.literal("queue_stop"),
    args: z.array(z.void()).length(0),
    kwargs: z.record(z.void()),
  })
  .transform((data) => {
    const { item_type: itemType, ...unchanged } = data;
    return {
      itemType,
      ...unchanged,
    };
  });

export default {
  queueStop,
};
