"use client";

import { RotateCcwIcon } from "lucide-react";
import { api } from "@sophys-web/api-client/react";
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
import type { HistoryItemProps } from "../../lib/types";
import { useQueue } from "../_hooks/use-queue";
import { schema } from "../../lib/schemas/plans/complete-acquisition";

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
    <Card className="relative border-none bg-muted">
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <span className="break-all">{props.name}</span>
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
  );
}

function HistoryItem({ props }: { props: HistoryItemProps }) {
  const { data: planParams } = schema.safeParse(props.kwargs);
  const status = function () {
    if (props.result.traceback) {
      return props.result.exitStatus ?? "failed";
    }
    return props.result.exitStatus ?? "unknown";
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
            <span className="break-all">{props.name}</span>
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
