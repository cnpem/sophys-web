"use-client";

import React, { useCallback } from "react";
import { GlassWaterIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@sophys-web/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sophys-web/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";
import {
  WindowCard,
  WindowCardAction,
  WindowCardContent,
  WindowCardHeader,
  WindowCardTitle,
} from "@sophys-web/ui/window-card";
import type { Sample } from "./sample-item";
import { useSSEData } from "~/app/_hooks/use-sse-data";
import { trayOptions } from "~/lib/constants";
import {
  trayColumns as COLUMNS,
  trayRows as ROWS,
} from "../../../lib/constants";
import { clearSamples } from "../../actions/samples";
import { SampleItemMenu } from "./sample-item";

const [TRAY1, TRAY2] = trayOptions;

interface TrayProps {
  samples: Sample[];
}

function TrayContentLoading() {
  return (
    <div
      style={{
        display: "grid",
        gap: "0.25rem",
        gridTemplateColumns: `repeat(${COLUMNS.length + 1}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS.length + 1}, 1fr)`,
      }}
    >
      <div />
      {COLUMNS.map((col) => (
        <div
          className="flex items-center justify-center text-sm font-semibold"
          key={col}
        >
          {col}
        </div>
      ))}
      {ROWS.map((row) => (
        <React.Fragment key={row}>
          <div className="flex items-center justify-center text-sm font-semibold">
            {row}
          </div>
          {COLUMNS.map((col) => (
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
    </div>
  );
}

function TrayContent(props: TrayProps) {
  const tray = props.samples;

  return (
    <div
      style={{
        display: "grid",
        gap: "0.25rem",
        gridTemplateColumns: `repeat(${COLUMNS.length + 1}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS.length + 1}, 1fr)`,
      }}
    >
      <div />

      {COLUMNS.map((col) => (
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
            {index % COLUMNS.length === 0 && (
              <div className="flex items-center justify-center text-sm font-normal md:text-base">
                {ROWS[index / COLUMNS.length]}
              </div>
            )}
            <SampleItemMenu sample={sample} />
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SampleTypeLegend() {
  return (
    <div className="flex flex-row gap-2 text-xs">
      <span className="flex size-5 items-center justify-center rounded-full border border-cyan-400 bg-cyan-300 text-cyan-800">
        s
      </span>
      <span>sample</span>
      <span className="flex size-5 items-center justify-center rounded-full border border-cyan-300 bg-cyan-300/10 text-cyan-600">
        b
      </span>
      <span>buffer</span>
    </div>
  );
}

export function Samples({
  initialData,
  className,
}: {
  initialData: Sample[];
  className?: string;
}) {
  const { data: samples, isConnected } = useSSEData<Sample[]>("/api/samples", {
    initialData,
  });

  const clearAllSamples = useCallback(async () => {
    toast.info("Clearing samples");
    await clearSamples();
  }, []);

  const isEmpty = samples?.every(
    (sample) =>
      sample.sampleType === undefined &&
      sample.sampleTag === undefined &&
      sample.bufferTag === undefined,
  );
  return (
    <WindowCard className={className}>
      <WindowCardHeader>
        <WindowCardTitle>
          <GlassWaterIcon className="mx-1 size-4" />
          Samples
        </WindowCardTitle>
        <WindowCardAction>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={isEmpty}
                  onClick={clearAllSamples}
                  size="icon"
                  variant="outline"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="font-normal">
                Clear Samples
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </WindowCardAction>
      </WindowCardHeader>
      <WindowCardContent className="pb-6">
        <Tabs className="space-y-2" defaultValue={"tray1"}>
          <div className="flex flex-row items-center justify-between">
            <SampleTypeLegend />
            <TabsList>
              <TabsTrigger value="tray1" disabled={!isConnected}>
                Tray 1
              </TabsTrigger>
              <TabsTrigger value="tray2" disabled={!isConnected}>
                Tray 2
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="tray1">
            {!isConnected && <TrayContentLoading />}
            {isConnected && (
              <TrayContent
                samples={
                  samples?.filter((sample) => sample.tray === TRAY1) ??
                  initialData.filter((sample) => sample.tray === TRAY1)
                }
              />
            )}
          </TabsContent>
          <TabsContent value="tray2">
            <TrayContent
              samples={
                samples?.filter((sample) => sample.tray === TRAY2) ??
                initialData.filter((sample) => sample.tray === TRAY2)
              }
            />
          </TabsContent>
        </Tabs>
      </WindowCardContent>
    </WindowCard>
  );
}
