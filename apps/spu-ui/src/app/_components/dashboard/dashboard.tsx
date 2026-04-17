"use client";

import { ButtonGroup } from "@sophys-web/ui/button-group";
import { ItemGroup } from "@sophys-web/ui/item";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { CompactQueue } from "@sophys-web/widgets/compact-queue";
import { Console } from "@sophys-web/widgets/console";
import { Controls } from "@sophys-web/widgets/controls";
import { OnDemandSelector } from "../plans/on-demand-queue-items";
import { UploadQueue } from "../plans/setup1-upload";
import { CapillaryStateMonitor } from "./capillary-state-monitor";
import { SampleStores } from "./sample-stores";
import { SampleTemperatureMonitor } from "./sample-temperature";

export function Dashboard() {
  return (
    <>
      <Controls>
        <ButtonGroup>
          <UploadQueue />
          <OnDemandSelector />
        </ButtonGroup>
      </Controls>
      <div className="flex gap-2 p-2 pt-16 sm:flex-col lg:flex-row">
        <ScrollArea className="w-full lg:h-svh lg:min-w-2/3">
          <div className="flex flex-col gap-2">
            <CompactQueue />
            <Console />
          </div>
        </ScrollArea>
        <ScrollArea className="flex w-fit flex-col">
          <div className="flex w-full flex-col gap-2">
            <ItemGroup className="gap-2">
              <SampleTemperatureMonitor />
              <CapillaryStateMonitor />
            </ItemGroup>
            <SampleStores />
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
