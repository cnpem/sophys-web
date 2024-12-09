"use client";

import { useCallback } from "react";
import { PlayIcon, SquareIcon, Trash2Icon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { toast } from "@sophys-web/ui/sonner";
import { useQueue } from "../../_hooks/use-queue";
import { useStatus } from "../../_hooks/use-status";
import { api } from "../../../trpc/react";
import { EnvMenu } from "../env-menu";
import { History } from "../history";
import { getEngineStatus } from "../run-engine-controls";
import { QueueItem, RunningItem, SkeletonItem } from "./queue-item";

function QueueSkeleton() {
  return (
    <div className="grid max-w-screen-xl grid-cols-3 gap-2">
      <div className="flex flex-col gap-2">
        <span className="items-center justify-center rounded-md border border-muted bg-slate-50 p-1 text-center capitalize text-muted-foreground">
          Queue
        </span>
        <div className="relative flex h-[calc(100vh-200px)] flex-col">
          <ul className="space-y-2">
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </ul>
        </div>
      </div>
      <div className="flex h-fit flex-col gap-2">
        <span className="items-center justify-center rounded-md border border-muted bg-slate-50 p-1 text-center capitalize text-muted-foreground">
          loading
        </span>
        <ul className="space-y-2">
          <SkeletonItem />
        </ul>
      </div>
      <div className="flex h-fit flex-col gap-2">
        <span className="items-center justify-center rounded-md border border-muted bg-slate-50 p-1 text-center capitalize text-muted-foreground">
          History
        </span>
        <ul className="space-y-2">
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
        </ul>
      </div>
    </div>
  );
}

function QueueCounter() {
  const { queue } = useQueue();
  return (
    <div className="flex items-center justify-center rounded-md border border-muted bg-slate-50 p-1 text-center text-muted-foreground">
      <span className="mr-2 font-medium">Queue</span>
      <span className="rounded-md border-none bg-slate-200 px-2 font-bold">
        {queue.data?.items.length}
      </span>
    </div>
  );
}

export function Queue() {
  const { queue } = useQueue();
  const isEmpty =
    queue.data?.items.length === 0 && !queue.data.runningItem?.itemUid;

  if (queue.isLoading) {
    return <QueueSkeleton />;
  }

  return (
    <div className="grid w-full grid-cols-3 gap-2">
      <div className="flex flex-col gap-2">
        <QueueCounter />
        <ScrollArea className="relative flex h-[calc(100vh-200px)] flex-col">
          {isEmpty ? (
            <p className="text-center text-muted-foreground">Queue is empty.</p>
          ) : (
            <ul className="space-y-2">
              {queue.data?.items.map((item) => (
                <QueueItem key={item.itemUid} props={item} />
              ))}
            </ul>
          )}
        </ScrollArea>
      </div>
      <RunningSection />

      <History />
    </div>
  );
}

function RunningSection() {
  const { status } = useStatus();
  const { queue } = useQueue();
  return (
    <div className="flex h-fit flex-col gap-2">
      <span className="items-center justify-center rounded-md border border-muted bg-slate-50 p-1 text-center capitalize text-muted-foreground">
        {getEngineStatus(status.data?.reState)}
      </span>
      {queue.data?.runningItem?.itemUid ? (
        <RunningItem
          key={queue.data.runningItem.itemUid}
          props={queue.data.runningItem}
        />
      ) : (
        <span className="text-center text-muted-foreground">
          No running item.
        </span>
      )}
    </div>
  );
}

export function QueueControls() {
  const { clear, start, stop } = useQueue();
  const utils = api.useUtils();
  const { mutate: clearHistory } = api.history.clear.useMutation({
    onSuccess: () => {
      toast.success("History cleared");
    },
    onError: () => {
      toast.error("Failed to clear history");
    },
    onSettled: async () => {
      await utils.history.get.invalidate();
    },
  });
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
    <div className="flex items-center justify-start gap-2">
      <EnvMenu />
      <Button
        disabled={!status.data?.reState || status.data.itemsInQueue === 0}
        onClick={() => {
          if (status.data?.reState === "running") {
            stopQueue();
          } else {
            startQueue();
          }
        }}
        size="sm"
        variant="default"
      >
        {status.data?.reState !== "running" ? (
          <>
            <PlayIcon className="mr-2 h-4 w-4" />
            Start
          </>
        ) : (
          <>
            <SquareIcon className="mr-2 h-4 w-4" />
            Stop
          </>
        )}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="destructive">
            <Trash2Icon className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              clearQueue();
            }}
          >
            Clear Queue
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              clearHistory();
            }}
          >
            Clear History
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
