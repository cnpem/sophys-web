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
  const sampleInfo = loadedSample
    ? `"${loadedSample.sampleTag}" ${loadedSample.tray}-${loadedSample.row}${loadedSample.col}`
    : undefined;
  return (
    <Item>
      <ItemMedia>
        <CylinderIcon className="size-8 text-blue-500" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Capillary State</ItemTitle>
        <ItemDescription
          data-state={capillaryState}
          className="text-md font-semibold data-[state=clean]:text-emerald-400 data-[state=error]:text-red-400 data-[state=sample]:text-sky-400 data-[state=stale]:text-amber-400"
        >
          {capillaryState}
          {loadedSample && <>: {sampleInfo}</>}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
