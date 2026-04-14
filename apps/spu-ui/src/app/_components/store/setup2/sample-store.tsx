import React, { useCallback } from "react";
import { GlassWaterIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@sophys-web/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@sophys-web/ui/accordion";
import { Button } from "@sophys-web/ui/button";
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
import { cardColumns, cardIndexOptions, cardRows } from "./constants";
import { SampleItem } from "./sample-item";
import { sampleIdFromPosition, useSampleStore } from "./use-sample-store";

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

  return (
    <WindowCard className={className}>
      <WindowCardHeader>
        <WindowCardTitle>
          <GlassWaterIcon className="mx-1 size-4" />
          Samples Setup 2
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
        <Accordion
          type="single"
          collapsible
          className="w-full rounded-md border"
        >
          {cardIndexOptions.map((cardIndex) => (
            <SampleCardAccordionItem key={cardIndex} cardIndex={cardIndex} />
          ))}
        </Accordion>
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

function SampleCardGrid({
  cardIndex,
}: {
  cardIndex: (typeof cardIndexOptions)[number];
}) {
  const { storeData } = useSampleStore();
  return (
    <div
      className={cn(
        "grid grid-flow-row justify-items-center gap-2",
        `grid-cols-5`, // cardColumns + 1
        `grid-rows-7`, // cardRows + 1
      )}
    >
      {/* fill first row with column headers*/}
      <div className="flex items-center justify-center text-sm font-normal md:text-base" />
      {cardColumns.map((col) => (
        <div
          className="flex items-center justify-center text-sm font-normal md:text-base"
          key={`header-${col}`}
        >
          {col}
        </div>
      ))}
      {cardRows.map((row) => (
        <React.Fragment key={`row-${row}`}>
          {/* first column is the row id */}
          <div
            className="flex items-center justify-center text-sm font-normal md:text-base"
            key={`header-${row}`}
          >
            {row}
          </div>
          {/* fill the rest of the row with sample items */}
          {cardColumns.map((column) => {
            const sampleId = sampleIdFromPosition({
              cardIndex,
              row,
              column,
            });
            const sample = storeData?.[sampleId];
            return (
              <SampleItem key={sampleId} sampleId={sampleId} sample={sample} />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

function SampleCardAccordionItem({
  cardIndex,
}: {
  cardIndex: (typeof cardIndexOptions)[number];
}) {
  const { storeData } = useSampleStore();
  const isEmpty =
    !storeData ||
    Object.values(storeData).filter((s) => s.cardIndex === cardIndex).length ===
      0;

  return (
    <AccordionItem
      value={cardIndex}
      className="border-b px-2 pt-2 last:border-0"
    >
      <AccordionTrigger
        // disabled={isEmpty}
        className={cn(isEmpty && "opacity-50")}
      >{`Card ${cardIndex}`}</AccordionTrigger>
      <AccordionContent className="gap-4 p-4">
        <SampleCardGrid cardIndex={cardIndex} />
      </AccordionContent>
    </AccordionItem>
  );
}
