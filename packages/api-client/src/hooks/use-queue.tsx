"use client";

import type { z } from "zod";
import { nanoid } from "nanoid";
import type { schemas } from "@sophys-web/api";
import { api } from "../react";

type QueueResponse = z.infer<typeof schemas.queue.getResponseSchema>;
type QueueItemProps =
  | QueueResponse["items"][number]
  | QueueResponse["runningItem"];

export const useQueue = () => {
  const utils = api.useUtils();

  const onSettled = async () => {
    await utils.queue.get.invalidate();
  };

  const queue = api.queue.get.useQuery();

  const add = api.queue.item.add.useMutation({
    onMutate: async (plan) => {
      // cancel any outgoing fetches
      await utils.queue.get.cancel();
      // snapshot the current value
      const previousValue = utils.queue.get.getData();
      // simulate item response object based on the item passed in
      const newItemResponse: QueueItemProps = {
        ...plan.item,
        user: "you",
        userGroup: "",
        itemUid: `optimistic-${nanoid()}`,
        result: null,
      };
      // optimistically update the cache
      utils.queue.get.setData(
        undefined,
        previousValue
          ? {
              ...previousValue,
              items: [newItemResponse, ...previousValue.items],
            }
          : undefined,
      );
      return { previousValue };
    },
    onError: (error, _variables, context) => {
      // rollback to the previous value
      utils.queue.get.setData(undefined, context?.previousValue);
      throw new Error(error.message.trim().replace(/\n/g, " "));
    },
    onSettled,
  });

  const addBatch = api.queue.item.addBatch.useMutation({ onSettled });

  const execute = api.queue.item.execute.useMutation({ onSettled });

  const remove = api.queue.item.remove.useMutation({ onSettled });

  const clear = api.queue.clear.useMutation({ onSettled });

  const start = api.queue.start.useMutation({ onSettled });

  const stop = api.queue.stop.useMutation({ onSettled });

  const update = api.queue.item.update.useMutation({ onSettled });

  const move = api.queue.item.move.useMutation({ onSettled });

  return {
    queue,
    add,
    execute,
    addBatch,
    update,
    move,
    remove,
    clear,
    start,
    stop,
  };
};
