"use client";

import { Fragment, useCallback } from "react";
import { ChevronRightIcon, GripVerticalIcon, XCircleIcon } from "lucide-react";
// import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import { Button } from "@sophys-web/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@sophys-web/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@sophys-web/ui/collapsible";
import { toast } from "@sophys-web/ui/sonner";
import type { HistoryItemProps, QueueItemProps } from "../../lib/types";
import { useQueue } from "../_hooks/use-queue";

export function QueueItem({
  isRunning,
  props,
}: {
  isRunning?: boolean;
  props: QueueItemProps;
}) {
  const { remove } = useQueue();

  const status = function () {
    if (isRunning) {
      return "running";
    }
    if (props?.itemUid || !props?.result) {
      return "enqueued";
    }
    if (props.result.traceback !== undefined) {
      return props.result.exitStatus ?? "failed";
    }
    return props.result.exitStatus ?? "finished";
  };

  const handleRemove = useCallback(() => {
    if (props?.itemUid !== undefined) {
      remove.mutate(
        { uid: props.itemUid },
        {
          onSuccess: () => {
            toast.success("Item removed from the queue.");
          },
          onError: () => {
            toast.error("Failed to remove item from the queue.");
          },
        },
      );
    }
  }, [props, remove]);

  return (
    <li>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>{props?.name ?? "item with no name"}</span>
            <Badge variant="outline">{status()}</Badge>
            <div className="flex space-x-2">
              <Button size="icon" variant="ghost">
                <GripVerticalIcon />
              </Button>
              <Button onClick={handleRemove} size="icon" variant="destructive">
                <XCircleIcon />
              </Button>
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">@{props?.user}</p>
        </CardHeader>
        <CardContent>
          {props?.kwargs ? (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center">
                <ChevronRightIcon className="mr-2 h-4 w-4" />
                <p className="text-sm text-muted-foreground">Details</p>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <dl className="grid grid-cols-2 justify-between pl-6 pt-2 text-sm">
                  {Object.entries(props.kwargs).map(([key, value]) => (
                    <Fragment key={key}>
                      <dt className="break-words font-medium">{key}:</dt>
                      <dd className="break-words">{String(value)}</dd>
                    </Fragment>
                  ))}
                </dl>
              </CollapsibleContent>
            </Collapsible>
          ) : null}
        </CardContent>
      </Card>
    </li>
  );
}

export function HistoryItem({ props }: { props: HistoryItemProps }) {
  const status = function () {
    if (props.result?.traceback) {
      return props.result.exitStatus ?? "failed";
    }
    return props.result?.exitStatus ?? "finished";
  };

  return (
    <li>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>{props.name}</span>
            <Badge variant="outline">{status()}</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">@{props.user}</p>
        </CardHeader>
        <CardContent>
          {props.kwargs ? (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center">
                <ChevronRightIcon className="mr-2 h-4 w-4" />
                <p className="text-sm text-muted-foreground">Details</p>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <dl className="grid grid-cols-2 justify-between pl-6 pt-2 text-sm">
                  {Object.entries(props.kwargs).map(([key, value]) => (
                    <Fragment key={key}>
                      <dt className="break-words font-medium">{key}:</dt>
                      <dd className="break-words">{String(value)}</dd>
                    </Fragment>
                  ))}
                </dl>
              </CollapsibleContent>
            </Collapsible>
          ) : null}
        </CardContent>
      </Card>
    </li>
  );
}
