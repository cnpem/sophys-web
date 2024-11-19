"use client";

import type {
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { useCallback, useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { PlayIcon, SquareIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import { toast } from "@sophys-web/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sophys-web/ui/tabs";
import type { SampleParams } from "../../lib/schemas/sample";
import type { Sample } from "./sample";
import { useQueue } from "../_hooks/use-queue";
import { useSSEData } from "../_hooks/use-sse-data";
import { useStatus } from "../_hooks/use-status";
import { trayOptions } from "../../lib/constants";
import { kwargsSubmitSchema, planName } from "../../lib/schemas/acquisition";
import { api } from "../../trpc/react";
import {
  clearSamples as clearServerSamples,
  setSamples as setServerSamples,
} from "../actions/samples";
import { Console } from "./console";
import { EnvMenu } from "./env-menu";
import { Queue } from "./queue";
import { SampleItem } from "./sample";
import { Tray } from "./tray";
import { UploadButton } from "./upload-button";

const [TRAY1, TRAY2] = trayOptions;

export function samplePosition(row: string, col: number, tray: string) {
  const colRepr = col.toString().padStart(2, "0");
  const relative = `${colRepr}${row}`;
  return {
    complete: `${tray}-${relative}`,
    relative,
  };
}

export default function Experiment({
  initialSamples,
}: {
  initialSamples: Sample[];
}) {
  const utils = api.useUtils();
  const { add, clear } = useQueue();
  const { status } = useStatus();
  const start = api.queue.start.useMutation();
  const stop = api.queue.stop.useMutation();
  const [samples] = useSSEData("/api/samples", {
    initialData: initialSamples,
  });
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const addToQueue = useCallback(
    async (sampleIds: UniqueIdentifier[]) => {
      sampleIds.forEach(async (id) => {
        const sample = samples.find((s) => s.id === id);
        if (!sample) {
          return;
        }
        const { data: planKwargs, success } = kwargsSubmitSchema.safeParse({
          ...sample,
          proposal: "p0000001",
        });
        if (!success) {
          return;
        }
        await add.mutateAsync(
          {
            item: {
              itemType: "plan",
              name: planName,
              kwargs: planKwargs,
              args: [],
            },
          },
          {
            onSuccess: () => {
              toast.success(`Sample ${sample.id} added to the queue`);
            },
            onError: () => {
              toast.error(`Failed to add sample ${sample.id} to the queue`);
            },
          },
        );
      });
      const updatedSamples = samples.map((s) =>
        sampleIds.includes(s.id) ? { ...s } : s,
      );
      await setServerSamples(updatedSamples);
    },
    [samples, add],
  );

  const startQueue = useCallback(() => {
    start.mutate(undefined, {
      onSuccess: async () => {
        await utils.queue.get.invalidate();
        toast.success("Queue started");
      },
      onError: async () => {
        await utils.queue.get.invalidate();
        toast.error("Failed to start queue");
      },
    });
  }, [start, utils.queue.get]);

  const stopQueue = useCallback(() => {
    stop.mutate(undefined, {
      onSuccess: async () => {
        await utils.queue.get.invalidate();
        toast.success("Queue stopped");
      },
      onError: async () => {
        await utils.queue.get.invalidate();
        toast.error("Failed to stop queue");
      },
    });
  }, [stop, utils.queue.get]);

  const clearQueue = useCallback(async () => {
    await clear.mutateAsync();
    toast.info("Queue cleared");
  }, [clear]);

  const clearSamples = async () => {
    return clearServerSamples();
  };

  const uploadSamples = async (data: SampleParams[]) => {
    const prevSamples = samples;
    const newSamples = data.map((sample) => {
      const { complete, relative } = samplePosition(
        sample.row,
        sample.col,
        sample.tray,
      );
      return {
        id: complete,
        relativePosition: relative,
        type: sample.sampleType === "buffer" ? "B" : "S",
        ...sample,
      } as Sample;
    });
    const updatedSamples = prevSamples.map((prevSample) => {
      const newSample = newSamples.find(
        (sample) => sample.id === prevSample.id,
      );
      return newSample ?? prevSample;
    });
    await setServerSamples(updatedSamples);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over } = event;

    if (over && over.id === "queue-dropzone") {
      await addToQueue([activeId ?? 0]);
    }

    setActiveId(null);
  };

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className="flex h-[calc(100vh-64px)] items-start justify-center gap-4 px-4 pt-4">
        <Tabs defaultValue="tray1">
          <div className="flex items-center gap-2">
            <TabsList>
              <TabsTrigger value="tray1">Tray 1</TabsTrigger>
              <TabsTrigger value="tray2">Tray 2</TabsTrigger>
            </TabsList>
            <UploadButton handleUpload={uploadSamples}>
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload Samples
            </UploadButton>
            <Button onClick={clearSamples} variant="link">
              <Trash2Icon className="mr-2 h-4 w-4" />
              Clear Samples
            </Button>
          </div>
          <TabsContent value="tray1">
            <Tray
              activeId={activeId}
              addToQueue={addToQueue}
              samples={samples.filter((sample) => sample.tray === TRAY1)}
            />
          </TabsContent>
          <TabsContent value="tray2">
            <Tray
              activeId={activeId}
              addToQueue={addToQueue}
              samples={samples.filter((sample) => sample.tray === TRAY2)}
            />
          </TabsContent>
        </Tabs>
        <div
          className="flex w-2/3 flex-col space-y-4"
          id="queue-console-column"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="mr-auto text-lg font-medium">Experiment Queue</h1>
              <EnvMenu />
              <Button
                disabled={
                  !status.data?.reState || status.data.itemsInQueue === 0
                }
                onClick={() => {
                  status.data?.reState === "running"
                    ? stopQueue()
                    : startQueue();
                }}
                variant="default"
              >
                {status.data?.reState !== "running" ? (
                  <>
                    <PlayIcon className="mr-2 h-4 w-4" />
                    Start Queue
                  </>
                ) : (
                  <>
                    <SquareIcon className="mr-2 h-4 w-4" />
                    Stop Queue
                  </>
                )}
              </Button>
              <Button
                disabled={status.data?.itemsInQueue === 0}
                onClick={clearQueue}
                variant="outline"
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                Clear Queue
              </Button>
            </div>
            <Queue />
          </div>
          <Console />
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          <SampleItem
            isDragging
            sample={
              samples.find((s) => s.id === activeId) ?? {
                id: activeId,
                relativePosition: "",
                type: null,
              }
            }
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
