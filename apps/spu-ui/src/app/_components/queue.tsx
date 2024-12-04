"use client";

import { useCallback } from "react";
import {
  PencilIcon,
  PlayIcon,
  SquareIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import { Button } from "@sophys-web/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { toast } from "@sophys-web/ui/sonner";
import type { QueueItemProps } from "../../lib/types";
import { useQueue } from "../_hooks/use-queue";
import { useStatus } from "../_hooks/use-status";
import { kwargsResponseSchema } from "../../lib/schemas/acquisition";
import { Dropzone } from "./dropzone";
import { EnvMenu } from "./env-menu";
import { History } from "./history";
import { RunEngineControls } from "./run-engine-controls";
import { Spinner } from "./spinner";

function RemoveButton({ uid }: { uid?: string }) {
  const { remove } = useQueue();
  const handleRemove = useCallback(() => {
    if (uid !== undefined) {
      remove.mutate({ uid });
    }
  }, [remove, uid]);
  return (
    <Button
      className="h-6 w-6"
      onClick={handleRemove}
      size="icon"
      variant="ghost"
    >
      <XIcon className="h-4 w-4" />
    </Button>
  );
}

function EditButton() {
  return (
    <Button className="w-full" disabled size="sm" variant="outline">
      <PencilIcon className="mr-2 h-4 w-4" />
      Edit item
    </Button>
  );
}

function UnknownItem({
  props,
  status,
}: {
  props: QueueItemProps;
  status: string;
}) {
  return (
    <li>
      <li>
        <Card className="relative border-none bg-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <span>{props?.name}</span>
              <Badge
                className={cn("border-none bg-slate-200 text-slate-800", {
                  "bg-red-200 text-red-800": status === "failed",
                  "bg-slate-200 text-slate-800": status === "enqueued",
                  "bg-blue-200 text-blue-800": status === "running",
                  "bg-yellow-200 text-yellow-800": !props?.itemUid,
                })}
                variant="outline"
              >
                {status}
              </Badge>
            </CardTitle>
            <CardDescription>
              @{props?.user}
              <div className="absolute right-2 top-2 flex gap-2">
                <RemoveButton uid={props?.itemUid} />
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      </li>
    </li>
  );
}

function SkeletonItem() {
  return (
    <li>
      <Card className="relative animate-pulse border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <span className="h-6 w-24 rounded bg-muted" />
            <Badge className="border-none bg-muted" variant="outline" />
          </CardTitle>
          <CardDescription className="space-y-2">
            <div className="flex gap-2">
              <span className="h-5 w-44 rounded bg-muted" />
              <span className="h-5 w-28 rounded bg-muted" />
            </div>
            <div className="flex gap-2">
              <Badge className="border-none bg-muted" variant="outline" />
              <Badge className="border-none bg-muted" variant="outline" />
              <Badge className="border-none bg-muted" variant="outline" />
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    </li>
  );
}

function PlaceholderItem() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <span className="h-6 w-24 rounded bg-muted" />
          <Badge className="border-none bg-muted" variant="outline" />
        </CardTitle>
        <CardDescription className="space-y-2">
          <div className="flex gap-2">
            <span className="h-5 w-44 rounded bg-muted" />
            <span className="h-5 w-28 rounded bg-muted" />
          </div>
          <div className="flex gap-2">
            <Badge className="border-none bg-muted" variant="outline" />
            <Badge className="border-none bg-muted" variant="outline" />
            <Badge className="border-none bg-muted" variant="outline" />
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function RunningItem({ props }: { props: QueueItemProps }) {
  const { data: planParams } = kwargsResponseSchema.safeParse(props?.kwargs);
  if (!planParams) {
    return <UnknownItem props={props} status="running" />;
  }
  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <span>{props?.name}</span>
          <Badge
            className="border-none bg-sky-200 text-sky-800"
            variant="outline"
          >
            running
          </Badge>
        </CardTitle>
        <CardDescription>
          @{props?.user} - {planParams.proposal}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{planParams.tray}</Badge>
          <Badge variant="outline">{`${planParams.col}${planParams.row}`}</Badge>
          <Badge
            className={cn("border-none bg-slate-400 text-slate-800", {
              "bg-emerald-200 text-emerald-800":
                planParams.sampleType === "sample",
              "bg-sky-200 text-sky-800": planParams.sampleType === "buffer",
            })}
            variant="outline"
          >
            {planParams.sampleType}
          </Badge>
          <Badge variant="default">{planParams.sampleTag}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function QueueItem({
  isRunning,
  props,
}: {
  isRunning?: boolean;
  props: QueueItemProps;
}) {
  const { data: planParams } = kwargsResponseSchema.safeParse(props?.kwargs);
  const status = function () {
    if (isRunning) {
      return "running";
    }
    if (!props?.itemUid) {
      return "enqueing";
    }
    if (!planParams || !props.result) {
      return "enqueued";
    }
    if (props.result.traceback) {
      return props.result.exitStatus ?? "failed";
    }
    return props.result.exitStatus ?? "finished";
  };

  if (!planParams) {
    return <UnknownItem props={props} status={status()} />;
  }

  return (
    <li>
      <Card
        className={cn("relative", {
          "animate-pulse border-none bg-slate-100": !props?.itemUid,
        })}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <span>{props?.name}</span>
            <Badge
              className={cn("border-none bg-slate-200 text-slate-800", {
                "bg-red-200 text-red-800": status() === "failed",
                "bg-slate-200 text-slate-800": status() === "enqueued",
                "bg-blue-200 text-blue-800": status() === "running",
                "bg-rose-200 text-rose-800": !props?.itemUid,
                "bg-yellow-200 text-yellow-800":
                  status() === "aborted" ||
                  status() === "halted" ||
                  status() === "stopped",
              })}
              variant="outline"
            >
              {status()}
            </Badge>
          </CardTitle>
          <CardDescription>
            @{props?.user} - {planParams.proposal}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{planParams.tray}</Badge>
            <Badge variant="outline">{`${planParams.col}${planParams.row}`}</Badge>
            <Badge
              className={cn("border-none bg-slate-400 text-slate-800", {
                "bg-emerald-200 text-emerald-800":
                  planParams.sampleType === "sample",
                "bg-sky-200 text-sky-800": planParams.sampleType === "buffer",
              })}
              variant="outline"
            >
              {planParams.sampleType}
            </Badge>
            <Badge variant="default">{planParams.sampleTag}</Badge>
          </div>
          <div className="absolute right-1 top-1 flex gap-2">
            <RemoveButton uid={props?.itemUid} />
          </div>
        </CardContent>
        <CardFooter>
          <EditButton />
        </CardFooter>
      </Card>
    </li>
  );
}

function QueueSkeleton() {
  return (
    <Dropzone id="queue-dropzone">
      <div className="flex flex-col gap-2">
        <QueueControls />
        <ul className="space-y-2">
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
        </ul>
      </div>
    </Dropzone>
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
  const { status } = useStatus();
  const isEmpty =
    queue.data?.items.length === 0 && !queue.data.runningItem?.itemUid;

  if (queue.isLoading) {
    return <QueueSkeleton />;
  }

  return (
    <div className="grid max-w-screen-xl grid-cols-3 gap-2">
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
      <div className="flex h-fit flex-col gap-2">
        <span className="items-center justify-center rounded-md border border-muted bg-slate-50 p-1 text-center capitalize text-muted-foreground">
          {status.data?.reState}
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
      <History />
    </div>
  );
}

export function QueueControls() {
  const { clear, start, stop } = useQueue();
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
          status.data?.reState === "running" ? stopQueue() : startQueue();
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
      <Button
        disabled={status.data?.itemsInQueue === 0}
        onClick={clearQueue}
        size="sm"
        variant="destructive"
      >
        <Trash2Icon className="mr-2 h-4 w-4" />
        Clear
      </Button>
    </div>
  );
}
