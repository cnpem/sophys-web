"use client";

import React, { useCallback, useState } from "react";
import { UploadIcon, ChevronsRightIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import { toast } from "@sophys-web/ui/sonner";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { SampleItem, type Sample } from "./sample";

interface TrayProps {
  rows: string[];
  columns: string[];
  samples: Sample[];
  activeId: UniqueIdentifier | null;
  addToQueue: (sampleId: UniqueIdentifier[]) => void;
}

export function Tray(props: TrayProps) {
  const [tray] = useState(props.samples);
  const { addToQueue } = props;
  const enqueueAll = useCallback(() => {
    addToQueue(
      tray.filter((sample) => sample.type !== null).map((sample) => sample.id),
    );
  }, [tray, addToQueue]);

  return (
    <div className="h-fit space-y-4 rounded-lg bg-gray-50 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Tray</h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              toast("Upload functionality not implemented yet.");
            }}
            size="icon"
            variant="outline"
          >
            <UploadIcon className="h-4 w-4" />
          </Button>
          <Button onClick={enqueueAll} size="icon" variant="outline">
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${props.columns.length + 1}, 1fr)`,
          gridTemplateRows: `repeat(${props.rows.length + 1}, 1fr)`,
        }}
      >
        <div className="" /> {/* Empty cell for top-left corner */}
        {props.columns.map((col) => (
          <div
            className="flex items-center justify-center font-bold text-purple-600"
            key={col}
          >
            {col}
          </div>
        ))}
        {props.rows.map((row) => (
          <React.Fragment key={row}>
            <div className="flex items-center justify-center font-bold text-emerald-600">
              {row}
            </div>
            {props.columns.map((col) => {
              const sample = props.samples.find((s) => s.id === `${col}${row}`);
              return sample ? (
                <SampleItem
                  isDragging={props.activeId === sample.id}
                  key={sample.id}
                  sample={sample}
                />
              ) : (
                <div className="w-12 h-12" key={`${col}${row}`} />
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-6 space-y-2">
        <p className="text-sm text-stone-600 text-center">
          Drag a sample to add it to the queue.
        </p>
      </div>
    </div>
  );
}
