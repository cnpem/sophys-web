"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import React, { useCallback } from "react";
import { ChevronsRightIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import { toast } from "@sophys-web/ui/sonner";
import type { Sample } from "./sample";
import { useQueue } from "../_hooks/use-queue";
import { trayColumns, trayRows } from "../../lib/constants";
import {
  kwargsSubmitSchema,
  planName,
} from "../../lib/schemas/plans/complete-acquisition";
import { SampleItem } from "./sample";

interface TrayProps {
  samples: Sample[];
  activeId: UniqueIdentifier | null;
}

export function Tray(props: TrayProps) {
  const tray = props.samples;
  const { addBatch } = useQueue();

  const enqueueAll = useCallback(async () => {
    const loadedSamples = tray.filter((sample) => sample.type !== null);
    const parsedKwargsList = loadedSamples.map((sample) => {
      const { data, success, error } = kwargsSubmitSchema.safeParse({
        ...sample,
        proposal: "pTEST",
      });
      if (success) {
        return {
          name: planName,
          args: [],
          kwargs: {
            ...data,
          },
          itemType: "plan",
        };
      }
      toast.error(`Failed to submit sample: ${error.message}`);
      return null;
    });
    const items = parsedKwargsList.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );
    if (items.length === 0) {
      return;
    }
    toast.info("Submitting batch to the queue");
    await addBatch.mutateAsync(
      { items },
      {
        onSuccess: () => {
          toast.success("Batch submitted");
        },
        onError: (error) => {
          toast.error(`Failed to submit batch: ${error.message}`);
        },
      },
    );
  }, [tray, addBatch]);

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle className="flex flex-row items-center justify-between text-lg font-medium">
          Tray
          <Button
            onClick={enqueueAll}
            size="icon"
            title="enqueue all"
            variant="outline"
          >
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${trayColumns.length + 1}, 1fr)`,
            gridTemplateRows: `repeat(${trayRows.length + 1}, 1fr)`,
          }}
        >
          <div />
          {trayColumns.map((col) => (
            <div
              className="flex items-center justify-center font-bold text-primary"
              key={col}
            >
              {col}
            </div>
          ))}
          {tray.map((sample, index) => {
            return (
              <React.Fragment key={sample.id}>
                {index % trayColumns.length === 0 && (
                  <div className="flex items-center justify-center font-bold text-emerald-600">
                    {trayRows[index / trayColumns.length]}
                  </div>
                )}
                <SampleItem
                  isDragging={props.activeId === sample.id}
                  key={sample.id}
                  sample={sample}
                />
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-center text-sm text-stone-600">
          Drag a sample to add it to the queue.
        </p>
      </CardFooter>
    </Card>
  );
}
