"use client";

import React, { useCallback } from "react";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@sophys-web/ui/button";
import {
  Card,
  CardContent,
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
import type { Sample } from "./sample";
import { trayColumns, trayRows } from "../../lib/constants";
import { clearTray } from "../actions/samples";
import { SampleItem } from "./sample";

interface TrayProps {
  samples: Sample[];
}

export function Tray(props: TrayProps) {
  const tray = props.samples;

  const clearServerSamples = useCallback(async () => {
    const trayId = tray[0]?.tray;
    if (!trayId) {
      toast.error("Unable to load tray info.");
      return;
    }
    toast.info("Clearing tray");
    await clearTray(trayId);
  }, [tray]);

  return (
    <Card className="max-w-xl space-y-4 rounded-md p-0 shadow-none">
      <CardHeader className="relative flex items-center justify-center rounded-sm border-b border-slate-300 bg-slate-100 p-2">
        <CardTitle className="flex items-center text-base font-semibold">
          Tray
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={tray.every((sample) => sample.type === undefined)}
                  onClick={clearServerSamples}
                  size="icon"
                  variant="outline"
                  className="absolute end-1 size-8"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-normal">Clear</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
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
      <CardFooter className="flex flex-col items-center justify-center gap-2 p-2">
        <p className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
          <span className="size-3 rounded-full bg-sky-200" />
          <span>sample</span>
          <span className="size-3 rounded-full bg-emerald-200" />
          <span>buffer</span>
        </p>
        <p className="text-muted-foreground text-center text-sm">
          Click on a sample to load it to the queue or on a empty slot to add an
          new sample.
        </p>
      </CardFooter>
    </Card>
  );
}

export function LoadingTray() {
  return (
    <Card className="space-y-4 rounded-md p-0 shadow-none">
      <CardHeader className="relative flex items-center justify-center border-b border-slate-300 bg-slate-100 p-2">
        <CardTitle className="flex items-center text-base font-semibold text-slate-700">
          Tray
        </CardTitle>
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
