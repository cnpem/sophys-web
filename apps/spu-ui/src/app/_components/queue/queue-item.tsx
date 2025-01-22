import React, { useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, XIcon } from "lucide-react";
import { useQueue } from "@sophys-web/api-client/hooks";
import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import { Button } from "@sophys-web/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";
import type { QueueItemProps } from "../../../lib/types";
import { ItemEditDialog } from "./item-edit-dialog";
import { QueueItemBadges, QueueItemStatusBadge } from "./queue-item-badges";

export function formatPlanNames(name: string) {
  return name.replace(/_/g, " ");
}

export function SkeletonItem() {
  return (
    <li>
      <Card className="relative animate-pulse border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <span className="h-6 w-24 rounded bg-muted" />
            <Badge className="border-none bg-muted" variant="outline" />
          </CardTitle>
          <CardDescription className="space-y-4">
            <div className="flex gap-2">
              <span className="h-5 w-64 rounded bg-muted" />
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

export function RunningItem({ props }: { props: QueueItemProps }) {
  return (
    <Card
      className={cn("relative rounded-sm border", {
        "animate-pulse border-none bg-slate-100": !props.itemUid,
      })}
    >
      <CardHeader>
        <CardDescription className="flex items-center gap-4">
          <QueueItemStatusBadge props={props} isRunning={true} />
          <span className="break-all">@{props.user}</span>
        </CardDescription>
        <CardTitle>
          <span className="break-all">{formatPlanNames(props.name)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <QueueItemBadges props={props} />
      </CardContent>
    </Card>
  );
}

export function QueueItem({
  queueItemProps,
  disabled,
}: {
  queueItemProps: QueueItemProps;
  disabled?: boolean;
}) {
  const {
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    transform,
    isDragging,
    transition,
  } = useSortable({
    id: queueItemProps.itemUid,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn("relative rounded-sm border", {
          "animate-pulse border-none bg-slate-100": !queueItemProps.itemUid,
          "opacity-60": disabled,
        })}
      >
        <CardHeader>
          <CardDescription className="flex items-center gap-4">
            <QueueItemStatusBadge props={queueItemProps} isRunning={false} />
            <span className="break-all">@{queueItemProps.user}</span>
          </CardDescription>
          <CardTitle>
            <span className="break-all">
              {formatPlanNames(queueItemProps.name)}
            </span>
          </CardTitle>
          <div className="absolute right-2 top-2 flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    ref={setActivatorNodeRef}
                    {...listeners}
                    className={cn("size-8 hover:cursor-grab", {
                      "hover:cursor-grabbing": isDragging,
                    })}
                    size="icon"
                    variant="outline"
                    disabled={disabled}
                  >
                    <GripVerticalIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Drag to move item</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ItemEditDialog props={queueItemProps} disabled={disabled} />
                </TooltipTrigger>
                <TooltipContent>Edit item</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <RemoveButton
                    uid={queueItemProps.itemUid}
                    disabled={disabled}
                  />
                </TooltipTrigger>
                <TooltipContent>Remove item</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <QueueItemBadges props={queueItemProps} />
        </CardContent>
      </Card>
    </li>
  );
}

const RemoveButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  { uid?: string; disabled?: boolean }
>(({ uid, disabled, ...buttonProps }, ref) => {
  const { remove } = useQueue();
  const handleRemove = useCallback(() => {
    if (uid !== undefined) {
      remove.mutate({ uid });
    }
  }, [remove, uid]);
  return (
    <Button
      ref={ref}
      className="size-8"
      onClick={handleRemove}
      size="icon"
      variant="outline"
      disabled={disabled}
      {...buttonProps}
    >
      <XIcon className="h-4 w-4" />
    </Button>
  );
});
