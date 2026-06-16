import React from "react";
import { usePvData } from "node_modules/@sophys-web/pvws-store/src/lib/hooks";
import { cn } from "@sophys-web/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@sophys-web/ui/accordion";
import { InfoTooltip } from "@sophys-web/widgets/form-components/info-tooltip";
import { PickCardButtonForm } from "../../plans/setup2-pick-card-by-index-form";
import { cardColumns, cardIndexOptions, cardRows } from "./constants";
import { DeleteSamplesDialog } from "./delete-samples";
import { OnDemandActions } from "./on-demand-actions-dropdown";
import { SampleCardState } from "./sample-card-state";
import { SampleItem } from "./sample-item";
import { sampleIdFromPosition, useSampleStore } from "./use-sample-store";

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
        `grid-cols-5`,
        `grid-rows-7`,
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

/**
 * Determines the status of a card based on its name value.
 * @param cardName
 * @returns
 */
function getCardNameStatus(
  cardName: string | null | undefined,
): "CardNotFound" | "NameNotFound" | "Identified" {
  if (!cardName) {
    return "CardNotFound";
  }
  if (cardName === "Not Identified by Robot") {
    return "CardNotFound";
  }
  if (cardName === "Not Identified by Cam") {
    return "NameNotFound";
  }
  return "Identified";
}

/**
 * Custom hook to get the name and status of a sample card based on its index.
 * It uses the usePvData hook to subscribe to the corresponding PV for the card name
 * and interprets the status based on the PV value.
 */
export const useSampleCardName = (
  cardIndex: (typeof cardIndexOptions)[number],
) => {
  const pvName = `SPU:B:YASKAWA01:Card${cardIndex}_RBV`;
  const pvData = usePvData(pvName);
  const cardName = pvData?.text;
  const status = getCardNameStatus(cardName);
  return {
    cardName: status === "Identified" ? cardName : undefined,
    status: status,
  };
};

interface SampleCardAccordionItemProps
  extends React.ComponentProps<typeof AccordionItem> {
  value: (typeof cardIndexOptions)[number];
}

function SampleCardAccordionItem({ ...props }: SampleCardAccordionItemProps) {
  const cardIndex = props.value;
  const { cardName, status } = useSampleCardName(cardIndex);

  return (
    <AccordionItem className="max-w-60 border-b" {...props}>
      <AccordionTrigger
        className={cn(
          "truncate",
          status === "CardNotFound" && "text-muted-foreground",
        )}
      >
        {`Card ${cardIndex}: `}
        <span>
          {status === "CardNotFound" && "Card not found"}
          {status === "NameNotFound" && "Not identified"}
          {status === "Identified" && cardName}
        </span>
      </AccordionTrigger>
      <AccordionContent className="my-2 flex w-full flex-col space-y-2">
        <PickCardButtonForm
          index={cardIndex}
          className="w-full"
          variant={"outline"}
          disabled={status === "CardNotFound"}
        />
        {status === "CardNotFound" && (
          <InfoTooltip variant={"destructive"}>
            <p className="w-40 text-sm">
              Card not found. Please run 'Detect Cards' to update the card hotel
              information.
            </p>
          </InfoTooltip>
        )}
        {status === "NameNotFound" && (
          <InfoTooltip variant={"subtle"}>
            <p className="w-40 text-sm">
              Card detected but not identified. Please check if the card is
              properly placed in the hotel and if the qr code is not damaged.
            </p>
          </InfoTooltip>
        )}
        {status === "Identified" && <span className="text-sm">{cardName}</span>}
        <SampleCardGrid cardIndex={cardIndex} />
      </AccordionContent>
    </AccordionItem>
  );
}
