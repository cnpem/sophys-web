"use client";

import React, { useCallback } from "react";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@sophys-web/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";
import type { Sample } from "./sample/sample-item";
import { trayColumns, trayRows } from "../../lib/constants";
import { clearTray } from "../actions/samples";
import { SampleItem } from "./sample/sample-item";

interface TrayProps {
  samples: Sample[];
}

export function Tray(props: TrayProps) {
  const tray = props.samples;
  const trayId = tray[0]?.tray;

  const clearServerSamples = useCallback(async () => {
    if (!trayId) {
      toast.error("Unable to load tray info.");
      return;
    }
    toast.info("Clearing tray");
    await clearTray(trayId);
  }, [trayId]);

  const trayIsEmpty = tray.every(
    (sample) =>
      sample.sampleType === undefined &&
      sample.sampleTag === undefined &&
      sample.bufferTag === undefined,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {trayId === "Tray1" ? "Tray 1" : "Tray 2"}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={trayIsEmpty}
                  onClick={clearServerSamples}
                  size="icon"
                  variant="outline"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-normal">
                Clear Tray
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Data loaded through this interface. You can register new ones by
          clicking on an empty slot or load tasks to the queue by clicking on a
          nonempty slot.
        </CardDescription>
      </CardHeader>
      <CardContent
        className="overflow-x-auto py-2"
        style={{
          display: "grid",
          gap: "0.25rem",
          gridTemplateColumns: `repeat(${trayColumns.length + 1}, minmax(2rem, 1fr))`,
          gridTemplateRows: `repeat(${trayRows.length + 1}, minmax(2rem, 1fr))`,
        }}
      >
        <div />

        {trayColumns.map((col) => (
          <div
            className="flex items-center justify-center text-sm font-normal md:text-base"
            key={col}
          >
            {col}
          </div>
        ))}
        {tray.map((sample, index) => {
          return (
            <React.Fragment key={sample.id}>
              {index % trayColumns.length === 0 && (
                <div className="flex items-center justify-center text-sm font-normal md:text-base">
                  {trayRows[index / trayColumns.length]}
                </div>
              )}
              <SampleItem key={sample.id} sample={sample} />
            </React.Fragment>
          );
        })}
      </CardContent>
      <CardFooter className="space-x-2 text-xs">
        <span className="flex size-5 items-center justify-center rounded-full border border-sky-400 bg-sky-200 text-sky-800">
          s
        </span>
        <span>sample</span>
        <span className="flex size-5 items-center justify-center rounded-full border border-emerald-400 bg-emerald-200 text-emerald-800">
          b
        </span>
        <span>buffer</span>
      </CardFooter>
    </Card>
  );
}

export function LoadingTray() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tray</CardTitle>
        <CardDescription>Loading tray data...</CardDescription>
      </CardHeader>
      <CardContent
        style={{
          display: "grid",
          gap: "0.25rem",
          gridTemplateColumns: `repeat(${trayColumns.length + 1}, 1fr)`,
          gridTemplateRows: `repeat(${trayRows.length + 1}, 1fr)`,
        }}
      >
        <div />
        {trayColumns.map((col) => (
          <div
            className="flex items-center justify-center text-sm font-semibold"
            key={col}
          >
            {col}
          </div>
        ))}
        {trayRows.map((row) => (
          <React.Fragment key={row}>
            <div className="flex items-center justify-center text-sm font-semibold">
              {row}
            </div>
            {trayColumns.map((col) => (
              <div
                className="flex items-center justify-center text-sm font-semibold"
                key={col}
              >
                <span className="bg-muted h-7 w-7 animate-pulse rounded-full text-white">
                  ...
                </span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
}
