import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@sophys-web/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@sophys-web/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sophys-web/ui/select";
import { InfoTooltip } from "@sophys-web/widgets/form-components/info-tooltip";
import { PickCardButtonForm } from "../../plans/setup2-pick-card-by-index-form";
import {
  cardCapillaryColumns,
  cardColumns,
  cardIndexOptions,
  cardModes,
  cardRows,
} from "./constants";
import { DeleteSamplesDialog } from "./delete-samples";
import { OnDemandActions } from "./on-demand-actions-dropdown";
import { SampleCardState } from "./sample-card-state";
import { SampleItem } from "./sample-item";
import {
  sampleIdEncoder,
  useSampleStore,
  useSampleStoreCard,
} from "./use-sample-store";

export function SampleStoreSetup2({ className }: { className?: string }) {
  const { error, parseError, isLoading, isPending } = useSampleStore();

  const isError = !!error || !!parseError;
  const isDisabled = isLoading || isPending || isError;

  return (
    <div className={cn("flex min-w-64 flex-col gap-4", className)}>
      <SampleCardState />
      <OnDemandActions />
      <Accordion
        type="single"
        collapsible
        className={cn({ "w-full opacity-50": isDisabled })}
      >
        {cardIndexOptions.map((cardIndex) => (
          <SampleCardAccordionItem key={cardIndex} value={cardIndex} />
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

const reverseSortedColumns = [...cardColumns].sort((a, b) =>
  b.localeCompare(a),
);

function generateSampleIds(
  cardIndex: (typeof cardIndexOptions)[number],
  type: "standard",
): string[][];
function generateSampleIds(
  cardIndex: (typeof cardIndexOptions)[number],
  type: "capillary",
): string[];
function generateSampleIds(
  cardIndex: (typeof cardIndexOptions)[number],
  type: SampleCardType,
): string[][] | string[] {
  if (type === "capillary") {
    return cardCapillaryColumns.map((column) =>
      sampleIdEncoder.parse({
        card: cardIndex,
        type: "capillary",
        position: { column },
      }),
    );
  }

  return cardRows.map((row) =>
    reverseSortedColumns.map((column) =>
      sampleIdEncoder.parse({
        card: cardIndex,
        type: "standard",
        position: { row, column },
      }),
    ),
  );
}

function SampleCardGrid({
  cardIndex,
}: {
  cardIndex: (typeof cardIndexOptions)[number];
}) {
  const sampleIds = useMemo(
    () => generateSampleIds(cardIndex, "standard"),
    [cardIndex],
  );

  return (
    <div
      className={cn(
        "grid grid-flow-row justify-items-center gap-1",
        `grid-cols-5`,
        `grid-rows-7`,
      )}
    >
      {/* first row with column headers*/}
      <div className="flex items-center justify-center text-sm font-normal md:text-base" />
      {reverseSortedColumns.map((col) => (
        <div
          className="flex items-center justify-center text-sm font-normal md:text-base"
          key={`header-${col}`}
        >
          {col}
        </div>
      ))}
      {sampleIds.map((rowSampleIds, rowIndex) => {
        const row = cardRows[rowIndex];
        return (
          <React.Fragment key={`row-${row}`}>
            {/* first column for row header */}
            <div
              className="flex items-center justify-center text-sm font-normal md:text-base"
              key={`header-${row}`}
            >
              {row}
            </div>
            {/* rest of the row with sample items */}
            {rowSampleIds.map((sampleId) => {
              // row 6 column D should not be displayed
              if (row === "6" && sampleId.split("-").includes("D6")) {
                return <div key={sampleId} />;
              }
              return (
                <SampleItem
                  key={sampleId}
                  sampleId={sampleId}
                  cardType="standard"
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SampleCardCapillary({
  cardIndex,
}: {
  cardIndex: (typeof cardIndexOptions)[number];
}) {
  const sampleIds = useMemo(
    () => generateSampleIds(cardIndex, "capillary"),
    [cardIndex],
  );

  return (
    <div className="mx-1 grid w-80 grid-flow-row grid-cols-11 justify-items-center gap-1">
      {sampleIds.map((sampleId) => (
        <div
          key={`column-${sampleId}`}
          className="flex w-fit flex-col items-center gap-1"
        >
          <SampleItem key={sampleId} sampleId={sampleId} cardType="capillary" />
          <span className="justify-center text-center text-sm">
            {sampleId.split("-")[1]} {/* Display the column letter */}
          </span>
        </div>
      ))}
    </div>
  );
}

interface SampleCardAccordionItemProps
  extends React.ComponentProps<typeof AccordionItem> {
  value: (typeof cardIndexOptions)[number];
}

/**
 * Defines tow types of sample cards: "grid" and "capillary".
 * The "grid" type corresponds to the standard card layout with samples arranged in a grid of rows 1-6 and columns D-A.
 * The "capillary" type corresponds to a different layout that supports 11 samples in vertical capillaries side by side and the samples
 * do not have row and column positions.
 */
type SampleCardType = (typeof cardModes)[number];

function SampleCardItems({
  cardIndex,
  type,
}: {
  cardIndex: (typeof cardIndexOptions)[number];
  type: SampleCardType;
}) {
  if (type === "capillary") {
    return <SampleCardCapillary cardIndex={cardIndex} />;
  }
  // default to "standard" grid layout if type is not "capillary"
  return <SampleCardGrid cardIndex={cardIndex} />;
}

// all sampleIds should contain
function SampleCardAccordionItem({ ...props }: SampleCardAccordionItemProps) {
  const cardIndex = props.value;
  // const { cardName, status } = useSampleCardName(cardIndex);
  const [sampleCardType, setSampleCardType] =
    useState<SampleCardType>("standard");

  const { cardType, cardName, cardStatus } = useSampleStoreCard(cardIndex);

  useEffect(() => {
    if (cardType) {
      setSampleCardType(cardType);
    }
  }, [cardType]);

  return (
    <AccordionItem className="border-b" {...props}>
      <AccordionTrigger
        className={cn(
          "truncate",
          cardStatus === "CardNotFound" && "text-muted-foreground",
        )}
      >
        {`Card ${cardIndex}: `}
        <span>
          {cardStatus === "CardNotFound" && "Card not found"}
          {cardStatus === "NameNotFound" && "Not identified"}
          {cardStatus === "Identified" && cardName}
        </span>
      </AccordionTrigger>
      <AccordionContent className="my-2 flex w-full flex-col space-y-2">
        <div className="flex flex-row items-center gap-1">
          <Select
            disabled={cardType !== undefined}
            value={sampleCardType}
            onValueChange={(value) =>
              setSampleCardType(value as SampleCardType)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select card type" />
            </SelectTrigger>
            <SelectContent>
              {cardModes.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <PickCardButtonForm
            index={cardIndex}
            variant={"outline"}
            disabled={cardStatus === "CardNotFound"}
          />
        </div>
        {cardStatus === "CardNotFound" && (
          <InfoTooltip variant={"destructive"}>
            <p className="w-40 text-sm">
              Card not found. Please run 'Detect Cards' to update the card hotel
              information.
            </p>
          </InfoTooltip>
        )}
        {cardStatus === "NameNotFound" && (
          <InfoTooltip variant={"subtle"}>
            <p className="w-40 text-sm">
              Card detected but not identified. Please check if the card is
              properly placed in the hotel and if the qr code is not damaged.
            </p>
          </InfoTooltip>
        )}

        <SampleCardItems cardIndex={cardIndex} type={sampleCardType} />
      </AccordionContent>
    </AccordionItem>
  );
}
