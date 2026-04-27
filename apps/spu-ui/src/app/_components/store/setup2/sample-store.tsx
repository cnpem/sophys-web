import React from "react";
import { usePvData } from "node_modules/@sophys-web/pvws-store/src/lib/hooks";
import { cn } from "@sophys-web/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@sophys-web/ui/accordion";
import { cardColumns, cardIndexOptions, cardRows } from "./constants";
import { DeleteSamplesDialog } from "./delete-samples";
import { DetectSampleCardsButtonForm } from "./detect-sample-cards-button";
import { ErrorsCheckoutButtonForm } from "./errors-checkout-button";
import { PickCardButtonForm } from "./pick-card-button";
import { RetrieveCardButtonForm } from "./retrieve-card-button";
import { SampleCardState } from "./sample-card-state";
import { SampleItem } from "./sample-item";
import { sampleIdFromPosition, useSampleStore } from "./use-sample-store";

export function Samples({ className }: { className?: string }) {
  const { error, parseError, isLoading, isPending } = useSampleStore();

  const isError = !!error || !!parseError;
  const isDisabled = isLoading || isPending || isError;

  return (
    <div className={cn("flex min-w-64 flex-col gap-4", className)}>
      <SampleCardState />
      <div className="flex flex-col gap-1">
        <ErrorsCheckoutButtonForm
          className="w-full"
          size="sm"
          variant="outline"
        />
        <DetectSampleCardsButtonForm
          className="w-full"
          size="sm"
          variant="outline"
        />
        <RetrieveCardButtonForm
          className="w-full"
          size="sm"
          variant="outline"
        />
      </div>
      <Accordion
        type="single"
        collapsible
        className={cn({ "w-full opacity-50": isDisabled })}
      >
        {cardIndexOptions.map((cardIndex) => (
          <SampleCardAccordionItem key={cardIndex} cardIndex={cardIndex} />
        ))}
      </Accordion>
      <div className="mt-2 flex items-center justify-end">
        <DeleteSamplesDialog />
      </div>
      {isError && (
        <div className="text-destructive mt-4 rounded-md bg-red-100 p-3 text-sm">
          {error && "Error loading samples: " + error.message}
          {parseError && "Error parsing samples: " + parseError.message}
        </div>
      )}
    </div>
  );
}

function SampleCardGrid({
  cardIndex,
}: {
  cardIndex: (typeof cardIndexOptions)[number];
}) {
  const { storeData } = useSampleStore();
  const reverseSortedColumns = [...cardColumns].sort((a, b) =>
    b.localeCompare(a),
  );
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
      {reverseSortedColumns.map((col) => (
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
          {/* fill the rest of the row with sample items
          with the cardColumns sorted in reverse order to match the visual layout of the card 
          */}
          {reverseSortedColumns.map((column) => {
            const sampleId = sampleIdFromPosition({
              cardIndex,
              row,
              column,
            });
            // do not show row 6 column D since it is not used in the actual card layout
            if (row === "6" && column === "D") {
              return <div key={sampleId} />;
            }
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
  const pvName = `SPU:B:YASKAWA01:Card${cardIndex}_RBV`;
  const pvData = usePvData(pvName);
  const notFound = !pvData?.text;

  return (
    <AccordionItem
      value={cardIndex}
      className="border-b px-2 pt-2 last:border-0"
    >
      <AccordionTrigger
        disabled={notFound}
      >{`Card ${cardIndex}`}</AccordionTrigger>
      <AccordionContent className="flex flex-col justify-center gap-4 p-4">
        <div className="flex flex-row items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {pvData?.text ?? "-"}
          </span>
          <PickCardButtonForm index={cardIndex} size="sm" variant={"outline"} />
        </div>
        <SampleCardGrid cardIndex={cardIndex} />
      </AccordionContent>
    </AccordionItem>
  );
}
