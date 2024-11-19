"use client";

import type { DragEndEvent } from "@dnd-kit/core";
import { useCallback } from "react";
import { DndContext } from "@dnd-kit/core";
// import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, XCircleIcon } from "lucide-react";
import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import { Button } from "@sophys-web/ui/button";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import type { QueueItemProps } from "../../lib/types";
import { useQueue } from "../_hooks/use-queue";
import { kwargsResponseSchema } from "../../lib/schemas/acquisition";
import { Dropzone } from "./dropzone";

function QueueItem({
  isRunning,
  props,
}: {
  isRunning?: boolean;
  props: QueueItemProps;
}) {
  // const {
  //   attributes,
  //   listeners,
  //   setNodeRef,
  //   transform,
  //   transition,
  //   setActivatorNodeRef,
  //   isDragging,
  // } = useSortable({ id: job.id, disabled: job.status === "running" });

  // const style = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  // };
  const { remove } = useQueue();

  const { data: planParams } = kwargsResponseSchema.safeParse(props?.kwargs);
  const status = function () {
    if (isRunning) {
      return "running";
    }
    // how can I get the running item?
    if (!planParams || !props?.result) {
      return "enqueued";
    }
    if (props.result.traceback) {
      return "failed";
    }
    return "completed";
  };

  const handleRemove = useCallback(() => {
    if (props?.itemUid !== undefined) {
      remove.mutate({ uid: props.itemUid });
    }
  }, [props, remove]);

  return (
    <li
      className={cn(
        "flex select-none items-center justify-between space-x-2 rounded-md bg-gray-50 p-3 shadow-md",
        // { "border-2 border-primary bg-primary/10": isDragging },
      )}
      // ref={setNodeRef}
      // style={style}
    >
      <div className="flex flex-grow items-center space-x-3">
        <div
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-full font-bold text-white",
            {
              "bg-gray-500": !planParams,
              "bg-emerald-500": planParams?.sampleType === "sample",
              "bg-sky-500": planParams?.sampleType === "buffer",
              "bg-gray-400": !props?.itemUid,
            },
          )}
        >
          {/* {sample.relativePosition} */}
          {planParams ? `${planParams.col}${planParams.row}` : "N/A"}
          <span className="absolute bottom-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-white text-xs text-black">
            {planParams ? planParams.sampleType.toUpperCase()[0] : "-"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {planParams ? (
            <div className="flex flex-col">
              <p className="font-bold">{planParams.sampleTag}</p>
              <p className="text-sm text-muted-foreground">
                {`${planParams.tray} |`}
                {planParams.sampleType !== "buffer" &&
                  ` buffer: ${planParams.bufferTag} |`}
                {` user: ${props?.user}`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              <p className="font-bold">{`${props?.name}`}</p>
              <p className="text-sm text-muted-foreground">
                {` user: ${props?.user}`}
              </p>
            </div>
          )}
        </div>
        <Badge variant="outline">{status()}</Badge>
        {status() === "running" && (
          <div className="h-2.5 w-24 rounded-full bg-gray-200">
            <div
              className="h-2.5 rounded-full bg-primary"
              style={{ width: `${20}%` }}
            />
          </div>
        )}
      </div>
      <Button
        // className={cn("cursor-grab", isDragging && "cursor-grabbing")}
        // ref={setActivatorNodeRef}
        size="icon"
        variant="ghost"
        // {...attributes}
        // {...listeners}
      >
        <GripVerticalIcon className="h-4 w-4" />
      </Button>
      <Button onClick={handleRemove} size="sm" variant="destructive">
        <XCircleIcon className="h-4 w-4" />
      </Button>
    </li>
  );
}

export function Queue() {
  const { queue } = useQueue();

  // const handleDragEnd = ({ active, over }: DragEndEvent) => {
  //   if (over && active.id !== over.id) {
  //     const activeIndex = queue.findIndex(({ id }) => id === active.id);
  //     const overIndex = queue.findIndex(({ id }) => id === over.id);

  //     updateQueue(arrayMove(queue, activeIndex, overIndex));
  //   }
  // };
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      console.log(`will move ${active.id} to ${over.id}`);
    }
  };

  return (
    <Dropzone id="queue-dropzone">
      <ScrollArea className="min-h-[300px] flex-grow">
        {queue.data?.items.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Queue is empty. Drag samples here to add them to the queue.
          </p>
        ) : (
          <DndContext onDragEnd={handleDragEnd}>
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
          </DndContext>
        )}
      </ScrollArea>
    </Dropzone>
  );
}
