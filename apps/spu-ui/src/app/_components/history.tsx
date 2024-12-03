"use client";

import { RotateCcwIcon, Trash2Icon } from "lucide-react";
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
import type { HistoryItemProps } from "../../lib/types";
import { useQueue } from "../_hooks/use-queue";
import { kwargsResponseSchema } from "../../lib/schemas/acquisition";
import { api } from "../../trpc/react";

function RedoButton(props: HistoryItemProps) {
  const { add } = useQueue();
  if (!props.kwargs) {
    return null;
  }
  const submitParams = {
    item: {
      name: props.name,
      kwargs: props.kwargs,
      args: [],
      itemType: props.itemType,
    },
  };
  return (
    <Button
      className="w-full"
      onClick={() => {
        add.mutate(submitParams);
      }}
      size="sm"
      variant="outline"
    >
      <RotateCcwIcon className="mr-2 h-4 w-4" />
      Copy to queue
    </Button>
  );
}

function UnknownItem({
  props,
  status,
}: {
  props: HistoryItemProps;
  status: string;
}) {
  return (
    <li>
      <li>
        <Card className="relative border-none bg-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <span>{props.name}</span>
              <Badge
                className={cn("border-none bg-slate-200 text-slate-800", {
                  "bg-red-200 text-red-800": status === "failed",
                  "bg-emerald-200 text-emerald-800": status === "completed",
                  "bg-yellow-200 text-yellow-800":
                    status === "aborted" ||
                    status === "halted" ||
                    status === "stopped",
                })}
                variant="outline"
              >
                {status}
              </Badge>
            </CardTitle>
            <CardDescription>@{props.user}</CardDescription>
          </CardHeader>
        </Card>
      </li>
    </li>
  );
}

function HistoryItem({ props }: { props: HistoryItemProps }) {
  const { data: planParams } = kwargsResponseSchema.safeParse(props.kwargs);
  const status = function () {
    if (!props.result) {
      return "unknown";
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
          "animate-pulse border-none bg-slate-100": !props.itemUid,
        })}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <span>{props.name}</span>
            <Badge
              className={cn("border-none bg-slate-200 text-slate-800", {
                "bg-red-200 text-red-800": status() === "failed",
                "bg-emerald-200 text-emerald-800": status() === "completed",
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
            @{props.user} - {planParams.proposal}
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
        <CardFooter>
          <RedoButton {...props} />
        </CardFooter>
      </Card>
    </li>
  );
}

export function History() {
  const { data } = api.history.get.useQuery(undefined, {
    refetchOnMount: "always",
  });

  return (
    <div className="flex flex-col gap-2">
      <HistoryControls />
      <div className="relative flex items-center justify-center rounded-lg border-2 border-muted p-4 font-medium">
        <ScrollArea className="flex h-[calc(100vh-560px)] flex-col">
          {data?.items.length === 0 ? (
            <p className="text-center text-muted-foreground">
              History is empty.
            </p>
          ) : (
            <ul className="space-y-2">
              {data?.items.map((item) => (
                <HistoryItem key={item.itemUid} props={item} />
              ))}
            </ul>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

function HistoryCounter() {
  const { data } = api.history.get.useQuery(undefined, {
    refetchOnMount: "always",
    refetchInterval: 10 * 1000,
  });

  return (
    <div className="flex w-full items-center justify-center rounded-md border border-slate-500 bg-slate-200 p-1 text-slate-700">
      <span className="mr-2 font-medium uppercase">On History</span>
      <span className="rounded-md border border-slate-500 bg-slate-100 px-1 font-bold">
        {data?.items.length}
      </span>
    </div>
  );
}

function HistoryControls() {
  const utils = api.useUtils();
  const { mutate } = api.history.clear.useMutation({
    onSuccess: async () => {
      toast.success("Queue cleared.");
      await utils.history.invalidate();
    },
  });
  return (
    <div className="flex items-center justify-start gap-2">
      <HistoryCounter />
      <Button
        onClick={() => {
          mutate();
        }}
        variant="outline"
      >
        <Trash2Icon className="mr-2 h-4 w-4" />
        Clear
      </Button>
    </div>
  );
}
