"use client";

import type { z } from "zod";
import { nanoid } from "nanoid";
import type { schemas } from "@sophys-web/api";
import { api } from "../react";
import { useStatus } from "./use-status";

type QueueResponse = z.infer<typeof schemas.queue.getResponseSchema>;
type QueueItemProps =
  | QueueResponse["items"][number]
  | QueueResponse["runningItem"];

export const useQueue = () => {
  const utils = api.useUtils();
  const { status } = useStatus();
  const loopMode = status.data?.planQueueMode.loop;

  const onSettled = async () => {
    await utils.httpserver.queue.get.invalidate();
  };

  const queue = api.httpserver.queue.get.useQuery();

  const add = api.httpserver.queue.item.add.useMutation({
    /** handling optimistic updates */
    onMutate: async (plan) => {
      // cancel any outgoing fetches
      await utils.httpserver.queue.get.cancel();
      // snapshot the current value
      const previousValue = utils.httpserver.queue.get.getData();
      // simulate item response object based on the item passed in
      const newItemResponse: QueueItemProps = {
        ...plan.item,
        user: "you",
        userGroup: "",
        itemUid: `optimistic-${nanoid()}`,
        result: null,
      };

      // optimistically update the cache
      utils.httpserver.queue.get.setData(
        undefined,
        previousValue
          ? {
              ...previousValue,
              // create new items list based on the plan.pos (if provided) or add to the end of the list
              items:
                plan.pos === "front"
                  ? [newItemResponse, ...previousValue.items]
                  : [...previousValue.items, newItemResponse],
            }
          : undefined,
      );
      return { previousValue };
    },
    onError: (error, _variables, context) => {
      // rollback to the previous value
      utils.httpserver.queue.get.setData(undefined, context?.previousValue);
      throw new Error(error.message.trim().replace(/\n/g, " "));
    },
    onSettled,
  });

  const addBatch = api.httpserver.queue.item.addBatch.useMutation({
    onSettled,
  });

  const execute = api.httpserver.queue.item.execute.useMutation({ onSettled });

  const remove = api.httpserver.queue.item.remove.useMutation({ onSettled });

  const clear = api.httpserver.queue.clear.useMutation({ onSettled });

  const start = api.httpserver.queue.start.useMutation({ onSettled });

  const stop = api.httpserver.queue.stop.useMutation({ onSettled });

  const update = api.httpserver.queue.item.update.useMutation({ onSettled });

  const move = api.httpserver.queue.item.move.useMutation({
    onSettled,
  });

  const setLoopMode = api.httpserver.queue.mode.set.useMutation({
    /** handling optimistic updates */
    onMutate: async ({
      loop = false,
      ignoreFailures = false,
    }: {
      loop?: boolean;
      ignoreFailures?: boolean;
    }) => {
      await utils.httpserver.status.get.cancel();
      const previousValue = utils.httpserver.status.get.getData();
      utils.httpserver.status.get.setData(undefined, (current) => {
        if (!current) return current;

        return {
          ...current,
          planQueueMode: {
            ...current.planQueueMode,
            ignoreFailures,
            loop,
          },
        };
      });
      return { previousValue };
    },
    onError: (error, _variables, context) => {
      // rollback to the previous value
      utils.httpserver.status.get.setData(undefined, context?.previousValue);
    },
  });

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
    setLoopMode,
    loopMode,
  };
};
