"use client";

import { api } from "../../trpc/react";

export const useQueue = () => {
  const apiUtils = api.useUtils();

  const get = api.queue.get.useQuery(undefined, {
    refetchInterval: 4000,
  });

  const add = api.queue.item.add.useMutation({
    onSuccess: async () => {
      await apiUtils.queue.get.invalidate();
    },
  });

  const remove = api.queue.item.remove.useMutation({
    onSuccess: async () => {
      await apiUtils.queue.get.invalidate();
    },
  });

  const clear = api.queue.clear.useMutation({
    onSuccess: async () => {
      await apiUtils.queue.get.invalidate();
    },
  });

  return {
    get,
    add,
    remove,
    clear,
  };
};
