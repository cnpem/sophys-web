"use client";

import { RotateCcwIcon } from "lucide-react";
import { useQueue } from "@sophys-web/api-client/hooks/use-queue";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import type { HistoryItemProps } from "../../lib/types";
import {
  formatPlanNames,
  PlanContent,
  QueueItemStatusBadge,
} from "./queue/queue-item";

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
      className="size-8"
      onClick={() => {
        add.mutate(submitParams);
      }}
      size="icon"
      variant="outline"
    >
      <RotateCcwIcon className="h-4 w-4" />
    </Button>
  );
}

function HistoryItem({ props }: { props: HistoryItemProps }) {
  return (
    <Card
      className={cn("relative rounded-sm border", {
        "animate-pulse border-none bg-slate-100": !props.itemUid,
      })}
    >
      <CardHeader>
        <CardDescription className="flex items-center gap-4">
          <QueueItemStatusBadge props={props} isRunning={false} />
          <span className="break-all">@{props.user}</span>
        </CardDescription>
        <CardTitle>
          <span className="break-all">{formatPlanNames(props.name)}</span>
        </CardTitle>
        <div className="absolute right-2 top-2 flex gap-1">
          <RedoButton {...props} />
        </div>
      </CardHeader>
      <CardContent>
        <PlanContent props={props} />
      </CardContent>
    </Card>
  );
}

export function History() {
  const { data } = api.history.get.useQuery(undefined, {
    refetchOnMount: "always",
  });

  return (
    <div className="flex flex-col gap-2">
      <HistoryCounter />
      <ScrollArea className="flex h-[630px] flex-col">
        {data?.items.length === 0 ? (
          <p className="text-center text-muted-foreground">History is empty.</p>
        ) : (
          <ul className="space-y-2">
            {data?.items
              .sort((a, b) => b.result.timeStop - a.result.timeStop)
              .map((item) => <HistoryItem key={item.itemUid} props={item} />)}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}

function HistoryCounter() {
  const { data } = api.history.get.useQuery(undefined, {
    refetchOnMount: "always",
    refetchInterval: 10 * 1000,
  });

  return (
    <div className="flex items-center justify-center rounded-md border border-muted bg-slate-50 p-1 text-center text-muted-foreground">
      <span className="mr-2 font-medium">History</span>
      <span className="rounded-md border-none bg-slate-200 px-2 font-bold">
        {data?.items.length}
      </span>
    </div>
  );
}
