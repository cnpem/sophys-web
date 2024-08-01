"use client";
import { Button } from "@repo/ui/button";
import { api } from "../../trpc/react";

export function AddSleep() {
  const utils = api.useUtils();
  const { mutate, isPending } = api.queue.queueItemAddSleep.useMutation({
    onSuccess: async () => {
      await utils.queue.queueGet.invalidate();
    },
  });

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        mutate({ time: 20 });
      }}
    >
      Add sleep to queue
    </Button>
  );
}

export function QueueStart() {
  const utils = api.useUtils();
  const { mutate, isPending } = api.queue.queueStart.useMutation({
    onSuccess: async () => {
      await utils.queue.queueGet.invalidate();
    },
  });

  return (
    <Button
      className="bg-green-700"
      disabled={isPending}
      onClick={() => {
        mutate();
      }}
    >
      Queue Start
    </Button>
  );
}
