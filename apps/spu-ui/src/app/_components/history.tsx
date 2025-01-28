"use client";

import React, { useEffect, useState } from "react";
import { format, fromUnixTime } from "date-fns";
import { RotateCcwIcon } from "lucide-react";
import { useQueue } from "@sophys-web/api-client/hooks";
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
import { Input } from "@sophys-web/ui/input";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";
import type { HistoryItemProps } from "../../lib/types";
import { formatPlanNames } from "./queue/queue-item";
import {
  QueueItemBadges,
  QueueItemStatusBadge,
} from "./queue/queue-item-badges";

function HistoryItem(props: HistoryItemProps) {
  const { name, kwargs, itemType } = props;
  const { add } = useQueue();
  return (
    <TooltipProvider>
      <Card
        className={cn("relative rounded-sm border", {
          "animate-pulse border-none bg-slate-100": !props.itemUid,
        })}
      >
        <CardHeader>
          <CardDescription className="flex items-center gap-4">
            <QueueItemStatusBadge props={props} />
            <span className="break-all">@{props.user}</span>
            <span>
              {format(fromUnixTime(props.result.timeStop), "MM/dd/yyyy")}
            </span>
          </CardDescription>
          <CardTitle>
            <span className="break-all">{formatPlanNames(props.name)}</span>
          </CardTitle>
          {kwargs && (
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      add.mutate({
                        item: {
                          name,
                          kwargs,
                          args: [],
                          itemType,
                        },
                      });
                    }}
                    size="icon"
                    className="absolute right-2 top-2 size-8"
                    variant="outline"
                  >
                    <RotateCcwIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <Tooltip>Resubmit this item to the queue</Tooltip>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <QueueItemBadges props={props} />
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function useSearchDebounced(search: string) {
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  return debouncedSearch;
}

export function History() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useSearchDebounced(search);
  const { data, isLoading } = api.history.get.useQuery(undefined, {
    select: (data) => ({
      items: data.items.filter((item) =>
        formatPlanNames(item.name)
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()),
      ),
    }),
  });

  if (isLoading || data === undefined) {
    return (
      <div className="flex h-full flex-col gap-2">
        <HistoryCounter />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search history by name"
        />
        <div className="flex h-[780px] justify-center bg-slate-50 p-1">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isEmpty = data.items.length === 0 && debouncedSearch.length === 0;

  if (isEmpty) {
    return (
      <div className="flex h-full flex-col gap-2">
        <HistoryCounter />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search history by name"
        />
        <div className="flex h-[780px] justify-center bg-slate-50 p-1">
          <p className="text-muted-foreground">History is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <HistoryCounter />
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search history by name"
      />
      <ScrollArea className="flex h-[780px] flex-col bg-slate-50 p-1">
        {data.items.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No history items found.
          </p>
        ) : (
          <ul className="space-y-2">
            {[...data.items]
              .sort((a, b) => b.result.timeStop - a.result.timeStop)
              .map((item) => (
                <HistoryItem key={item.itemUid} {...item} />
              ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}

function HistoryCounter() {
  const { data } = api.history.get.useQuery();

  return (
    <div className="flex items-center justify-center rounded-md border border-muted bg-slate-50 p-1 text-center text-muted-foreground">
      <span className="mr-2 font-medium">History</span>
      <span className="rounded-md border-none bg-slate-200 px-2 font-bold">
        {data?.items.length}
      </span>
    </div>
  );
}
