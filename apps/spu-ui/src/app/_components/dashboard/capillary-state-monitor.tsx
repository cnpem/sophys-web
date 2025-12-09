"use client";

import { CylinderIcon } from "lucide-react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@sophys-web/ui/item";
import { useCapillaryState } from "~/app/_hooks/use-capillary-state";

export function CapillaryStateMonitor() {
  const { capillaryState, loadedSample } = useCapillaryState();

  return (
    <Item>
      <ItemMedia>
        <CylinderIcon className="size-8 text-blue-500" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Capillary State</ItemTitle>
        <ItemDescription
          data-state={capillaryState}
          className="flex gap-2 text-lg font-semibold data-[state=clean]:text-emerald-400 data-[state=error]:text-red-400 data-[state=sample]:text-sky-400 data-[state=stale]:text-amber-400"
        >
          {capillaryState !== "sample" && capillaryState.toUpperCase()}
          {capillaryState === "sample" && loadedSample && (
            <>
              <span>{loadedSample.sampleType.toUpperCase()}</span>
              <span>{`(${loadedSample.tray}-${loadedSample.row}${loadedSample.col})`}</span>
              <span>"{loadedSample.sampleTag}"</span>
            </>
          )}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
