"use client";

import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { DndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { Badge } from "@sophys-web/ui/badge";
import { Button } from "@sophys-web/ui/button";
import { GripVerticalIcon, XCircleIcon } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@sophys-web/ui";
import { getSampleColor, type Sample } from "./sample";
import { Dropzone } from "./dropzone";

export interface Job {
  id: UniqueIdentifier;
  sampleId: UniqueIdentifier;
  status: "enqueued" | "running" | "done" | "cancelled";
  progress: number;
}

function QueueItem({
  job,
  sample,
  onRemove,
  onCancel,
}: {
  job: Job;
  sample: Sample;
  onRemove: () => void;
  onCancel: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
    isDragging,
  } = useSortable({ id: job.id, disabled: job.status === "running" });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li
      className={cn(
        "flex select-none items-center justify-between rounded-md bg-gray-50 p-3 shadow-sm space-x-2",
        isDragging && "border-2 border-primary bg-primary/10",
      )}
      ref={setNodeRef}
      style={style}
    >
      <div className="flex flex-grow items-center space-x-3">
        <div
          className={`h-8 w-8 rounded-full ${getSampleColor(
            sample.type,
          )} relative flex items-center justify-center font-bold text-white`}
        >
          {sample.type}
          <span className="absolute bottom-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-white text-xs text-black">
            {sample.id}
          </span>
        </div>
        <span className="font-medium">Sample {job.sampleId}</span>
        <Badge variant="outline">{job.status}</Badge>
        {job.status === "running" && (
          <div className="h-2.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2.5 rounded-full bg-primary"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        )}
      </div>
      <Button
        className={cn("cursor-grab", isDragging && "cursor-grabbing")}
        ref={setActivatorNodeRef}
        size="icon"
        variant="ghost"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="h-4 w-4" />
      </Button>
      {(job.status === "enqueued" || job.status === "running") && (
        <Button
          onClick={job.status === "enqueued" ? onRemove : onCancel}
          size="sm"
          variant="destructive"
        >
          <XCircleIcon className="h-4 w-4" />
        </Button>
      )}
    </li>
  );
}

export function Queue(props: {
  updateQueue: (value: React.SetStateAction<Job[]>) => void;
  toggleProcessing: (isProcessing: boolean) => void;
  removeFromQueue: (jobId: UniqueIdentifier) => void;
  cancelJob: (jobId: UniqueIdentifier) => void;
  queue: Job[];
  isProcessing: boolean;
  samples: Sample[];
}) {
  const { queue, samples, updateQueue, cancelJob, removeFromQueue } = props;
  const items = useMemo(() => queue.map((job) => job.id), [queue]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      const activeIndex = queue.findIndex(({ id }) => id === active.id);
      const overIndex = queue.findIndex(({ id }) => id === over.id);

      updateQueue(arrayMove(queue, activeIndex, overIndex));
    }
  };

  return (
    <Dropzone id="queue-dropzone">
      <ScrollArea className="h-[calc(100vh-240px)] flex-grow">
        {queue.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Queue is empty. Drag samples here to add them to the queue.
          </p>
        ) : (
          <DndContext onDragEnd={handleDragEnd}>
            <SortableContext items={items}>
              <ul className="space-y-2">
                {queue.map((job) => {
                  const sample = samples.find((s) => s.id === job.sampleId);
                  if (!sample) return null;
                  return (
                    <QueueItem
                      job={job}
                      key={job.id}
                      onCancel={() => {
                        cancelJob(job.id);
                      }}
                      onRemove={() => {
                        removeFromQueue(job.id);
                      }}
                      sample={sample}
                    />
                  );
                })}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </ScrollArea>
    </Dropzone>
  );
}
