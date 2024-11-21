"use client";

import type {
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { useCallback, useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { Trash2Icon, UploadIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import { toast } from "@sophys-web/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sophys-web/ui/tabs";
import type { SampleParams } from "../../lib/schemas/sample";
import type { Sample } from "./sample";
import { useQueue } from "../_hooks/use-queue";
import { useSSEData } from "../_hooks/use-sse-data";
import { trayOptions } from "../../lib/constants";
import { kwargsSubmitSchema, planName } from "../../lib/schemas/acquisition";
import {
  clearSamples as clearServerSamples,
  setSamples as setServerSamples,
} from "../actions/samples";
import { Console } from "./console";
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
  const { add } = useQueue();
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
              samples={samples.filter((sample) => sample.tray === TRAY1)}
            />
          </TabsContent>
          <TabsContent value="tray2">
            <Tray
              activeId={activeId}
              samples={samples.filter((sample) => sample.tray === TRAY2)}
            />
          </TabsContent>
        </Tabs>
        <div className="flex w-2/3 flex-col gap-4">
          <Queue />
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
