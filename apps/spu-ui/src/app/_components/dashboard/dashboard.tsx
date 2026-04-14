"use client";

import { ButtonGroup } from "@sophys-web/ui/button-group";
import { ItemGroup } from "@sophys-web/ui/item";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { CompactQueue } from "@sophys-web/widgets/compact-queue";
import { Console } from "@sophys-web/widgets/console";
import { Controls } from "@sophys-web/widgets/controls";
import { OnDemandSelector } from "../plans/on-demand-queue-items";
import { UploadQueue } from "../plans/upload";
import { Samples as Samples1 } from "../store/setup1/sample-store";
// import { Samples as Samples2 } from "../store/setup2/sample-store";
import { CapillaryStateMonitor } from "./capillary-state-monitor";
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
        <ScrollArea className="lg:h-svh lg:w-2/3">
          <div className="flex flex-col gap-2">
            <CompactQueue />
            <Console />
          </div>
        </ScrollArea>
        <ScrollArea className="flex flex-col lg:h-svh lg:w-1/3">
          <div className="flex w-full flex-col gap-2">
            <ItemGroup className="gap-2">
              <SampleTemperatureMonitor />
              <CapillaryStateMonitor />
            </ItemGroup>
            <Samples1 />
            {/* <Samples2 /> */}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
