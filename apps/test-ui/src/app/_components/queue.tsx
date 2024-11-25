"use client";

import { useCallback } from "react";
import { PlayIcon, SquareIcon, Trash2Icon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { toast } from "@sophys-web/ui/sonner";
import { useQueue } from "../_hooks/use-queue";
import { useStatus } from "../_hooks/use-status";
import { EnvMenu } from "./env-menu";
import { QueueItem } from "./queue-item";

export function Queue() {
  const { queue, clear, start, stop } = useQueue();
  const { status } = useStatus();

  const startQueue = useCallback(() => {
    start.mutate(undefined, {
      onSuccess: () => {
        toast.success("Queue started");
      },
      onError: () => {
        toast.error("Failed to start queue");
      },
    });
  }, [start]);

  const stopQueue = useCallback(() => {
    stop.mutate(undefined, {
      onSuccess: () => {
        toast.success("Queue stopped");
      },
      onError: () => {
        toast.error("Failed to stop queue");
      },
    });
  }, [stop]);

  const clearQueue = useCallback(() => {
    clear.mutate(undefined, {
      onSuccess: () => {
        toast.success("Queue cleared");
      },
      onError: () => {
        toast.error("Failed to clear queue");
      },
    });
  }, [clear]);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-row items-center justify-center gap-2 ">
        <h1 className="mr-auto text-lg font-medium">Experiment Queue</h1>
        <EnvMenu />
        <Button
          disabled={!status.data?.reState || status.data.itemsInQueue === 0}
          onClick={() => {
            status.data?.reState === "running" ? stopQueue() : startQueue();
          }}
          variant="default"
        >
          {status.data?.reState !== "running" ? (
            <>
              <PlayIcon className="mr-2 h-4 w-4" />
              Start Queue
            </>
          ) : (
            <>
              <SquareIcon className="mr-2 h-4 w-4" />
              Stop Queue
            </>
          )}
        </Button>
        <Button
          disabled={status.data?.itemsInQueue === 0}
          onClick={clearQueue}
          variant="outline"
        >
          <Trash2Icon className="mr-2 h-4 w-4" />
          Clear Queue
        </Button>
      </div>
      <div className="relative flex h-fit w-full items-center justify-center rounded-lg border-2 border-muted p-4 font-medium">
        <ScrollArea className="flex h-[calc(100vh-480px)] w-full flex-col">
          {queue.data?.items.length === 0 &&
          !queue.data.runningItem?.itemUid ? (
            <p className="text-center text-muted-foreground">
              Queue is empty. Drag samples here to add them to the queue.
            </p>
          ) : (
            <ul className="space-y-2">
              {queue.data?.runningItem?.itemUid ? (
                <QueueItem
                  isRunning
                  key={queue.data.runningItem.itemUid}
                  props={queue.data.runningItem}
                />
              ) : null}
              {queue.data?.items.map((item) => (
                <QueueItem key={item.itemUid} props={item} />
              ))}
            </ul>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
