"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import React, { useCallback } from "react";
import { ChevronsRightIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import type { Sample } from "./sample";
import { trayColumns, trayRows } from "../../lib/constants";
import { SampleItem } from "./sample";

interface TrayProps {
  samples: Sample[];
  activeId: UniqueIdentifier | null;
  addToQueue: (sampleId: UniqueIdentifier[]) => void;
}

export function Tray(props: TrayProps) {
  const tray = props.samples;
  const { addToQueue } = props;
  const enqueueAll = useCallback(() => {
    addToQueue(
      tray
        .filter((sample) => sample.type !== null && sample.isUsed !== true)
        .map((sample) => sample.id),
    );
  }, [tray, addToQueue]);

  return (
    <div className="h-fit space-y-4 rounded-lg bg-gray-50 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Tray</h2>
        <Button
          onClick={enqueueAll}
          size="icon"
          title="enqueue all"
          variant="outline"
        >
          <ChevronsRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${trayColumns.length + 1}, 1fr)`,
          gridTemplateRows: `repeat(${trayRows.length + 1}, 1fr)`,
        }}
      >
        <div /> {/* Empty cell for top-left corner */}
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
      <div className="mt-6 space-y-2">
        <p className="text-center text-sm text-stone-600">
          Drag a sample to add it to the queue.
        </p>
      </div>
    </div>
  );
}
