"use client";

import type { QueueItemProps } from "../../lib/types";
import { api } from "../../trpc/react";

export const useQueue = () => {
  const utils = api.useUtils();

  const queue = api.queue.get.useQuery(undefined, {
    refetchInterval: 4000,
  });

  const add = api.queue.item.add.useMutation({
    onMutate: async (plan) => {
      // cancel any outgoing fetches
      await utils.queue.get.cancel();
      // snapshot the current value
      const previousValue = utils.queue.get.getData();
      // simulate item response object based on the item passed in
      const newItemResponse: QueueItemProps = {
        ...plan.item,
        user: "",
        userGroup: "",
        itemUid: "",
        result: null,
      };
      // optimistically update the cache
      utils.queue.get.setData(
        undefined,
        previousValue
          ? {
              ...previousValue,
              items: [...previousValue.items, newItemResponse],
            }
          : undefined,
      );
      return { previousValue };
    },
    onError: (error, variables, context) => {
      // rollback to the previous value
      utils.queue.get.setData(undefined, context?.previousValue);
    },
    onSettled: async () => {
      // refetch the queue
      await utils.queue.get.invalidate();
    },
  });

  const addBatch = api.queue.item.addBatch.useMutation({
    onSettled: async () => {
      await utils.queue.get.invalidate();
    },
  });

  const remove = api.queue.item.remove.useMutation({
    onSettled: async () => {
      await utils.queue.get.invalidate();
    },
  });

  const clear = api.queue.clear.useMutation({
    onSettled: async () => {
      await utils.queue.get.invalidate();
    },
  });

  const start = api.queue.start.useMutation({
    onSettled: async () => {
      await utils.queue.get.invalidate();
    },
  });

  const stop = api.queue.stop.useMutation({
    onSettled: async () => {
      await utils.queue.get.invalidate();
    },
  });

  return {
    queue,
    add,
    addBatch,
    remove,
    clear,
    start,
    stop,
  };
};
