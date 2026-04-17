"use client";

import { ButtonGroup } from "@sophys-web/ui/button-group";
import { ItemGroup } from "@sophys-web/ui/item";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { CompactQueue } from "@sophys-web/widgets/compact-queue";
import { Console } from "@sophys-web/widgets/console";
import {
  ControlBar,
  EnvironmentControls,
  QueueControls,
} from "@sophys-web/widgets/control-bar/control-bar";
import { OnDemandSelector } from "../plans/on-demand-queue-items";
import { UploadQueue } from "../plans/setup1-upload";
import { CapillaryStateMonitor } from "./capillary-state-monitor";
import { CustomRunningItem } from "./custom-running-item";
import { SampleStores } from "./sample-stores";
import { SampleTemperatureMonitor } from "./sample-temperature";

export function Dashboard() {
  return (
    <>
      <ControlBar>
        <ButtonGroup>
          <EnvironmentControls />
          <QueueControls />
        </ButtonGroup>
        <ButtonGroup>
          <UploadQueue />
          <OnDemandSelector />
        </ButtonGroup>
      </ControlBar>
      <div className="flex gap-2 p-2 pt-16 sm:flex-col lg:flex-row">
        <ScrollArea className="w-full lg:h-svh lg:min-w-2/3">
          <div className="flex flex-col gap-2">
            <CompactQueue runningItem={<CustomRunningItem />} />
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
