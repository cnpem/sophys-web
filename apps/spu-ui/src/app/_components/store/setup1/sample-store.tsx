import React, { useCallback } from "react";
import { GlassWaterIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@sophys-web/ui";
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
import type { SampleStore } from "./use-sample-store";
import {
  trayColumns as COLUMNS,
  trayRows as ROWS,
  trayOptions,
} from "./constants";
import { SampleItem, sampleTypeVariants } from "./sample-item";
import { sampleIdFromPosition, useSampleStore } from "./use-sample-store";

const [TRAY1, TRAY2] = trayOptions;

function TrayContent({
  store,
  tray,
}: {
  store: SampleStore | undefined;
  tray: (typeof trayOptions)[number];
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: "0.25rem",
        gridTemplateColumns: `repeat(${COLUMNS.length + 1}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS.length + 1}, 1fr)`,
      }}
    >
      {/* fill the first row with headers and add the zero column, without a header */}
      <div
        className="flex items-center justify-center text-sm font-normal md:text-base"
        key={`header-zero`}
      />
      {COLUMNS.map((col) => (
        <div
          className="flex items-center justify-center text-sm font-normal md:text-base"
          key={`header-${col}`}
        >
          {col}
        </div>
      ))}

      {ROWS.map((row) => (
        <React.Fragment key={`row-${row}`}>
          {/* first column is the row id */}
          <div
            className="flex items-center justify-center text-sm font-normal md:text-base"
            key={`header-${row}`}
          >
            {row}
          </div>
          {/* fill the rest of the row with sample items */}
          {COLUMNS.map((col) => {
            const sampleId = sampleIdFromPosition(tray, row, col);
            const sample = store?.[sampleId];
            return (
              <SampleItem key={sampleId} sample={sample} sampleId={sampleId} />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

function SampleTypeLegend() {
  return (
    <div className="flex flex-row gap-2 text-xs">
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full border",
          sampleTypeVariants({ sampleType: "sample" }),
        )}
      >
        s
      </span>
      <span>sample</span>
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full border",
          sampleTypeVariants({ sampleType: "buffer" }),
        )}
      >
        b
      </span>
      <span>buffer</span>
    </div>
  );
}

export function Samples({ className }: { className?: string }) {
  const { storeData, clearStore, error, parseError, isLoading, isPending } =
    useSampleStore();

  const clearAllSamples = useCallback(async () => {
    toast.info("Clearing samples");
    await clearStore();
  }, [clearStore]);

  const isEmpty = storeData === undefined;
  const isError = !!error || !!parseError;
  const isDisabled = isLoading || isPending || isError;

  console.log("[Samples Component] Rendered with store data:", storeData);

  return (
    <WindowCard className={className}>
      <WindowCardHeader>
        <WindowCardTitle>
          <GlassWaterIcon className="mx-1 size-4" />
          Samples Setup 1
        </WindowCardTitle>
        <WindowCardAction>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={isDisabled || isEmpty}
                  onClick={clearAllSamples}
                  size="icon"
                  variant="outline"
                  className="mb-0.5"
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
      <WindowCardContent className={cn({ "opacity-50": isDisabled })}>
        <Tabs className="space-y-2" defaultValue={"tray1"}>
          <div className="flex flex-row items-center justify-between">
            <SampleTypeLegend />
            <TabsList>
              <TabsTrigger value="tray1">Tray 1</TabsTrigger>
              <TabsTrigger value="tray2">Tray 2</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="tray1">
            <TrayContent store={storeData} tray={TRAY1} />
          </TabsContent>
          <TabsContent value="tray2">
            <TrayContent store={storeData} tray={TRAY2} />
          </TabsContent>
        </Tabs>
        {isError && (
          <div className="text-destructive mt-4 rounded-md bg-red-100 p-3 text-sm">
            {error && "Error loading samples: " + error.message}
            {parseError && "Error parsing samples: " + parseError.message}
          </div>
        )}
      </WindowCardContent>
    </WindowCard>
  );
}
