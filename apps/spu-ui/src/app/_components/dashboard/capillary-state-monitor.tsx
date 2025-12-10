"use client";

import { CylinderIcon } from "lucide-react";
import { cn } from "@sophys-web/ui";
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
          className={cn(
            "flex gap-2 text-lg font-semibold",
            capillaryState === "clean" && "text-emerald-400",
            capillaryState === "error" && "text-red-400",
            capillaryState === "sample" && "text-cyan-400",
            capillaryState === "stale" && "text-gray-400",
          )}
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
