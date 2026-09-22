"use client";

import { ButtonGroup } from "@sophys-web/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import { ItemGroup } from "@sophys-web/ui/item";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { CompactQueue } from "@sophys-web/widgets/compact-queue";
import { Console } from "@sophys-web/widgets/console";
import {
  ControlBar,
  EnvironmentControls,
  QueueControls,
} from "@sophys-web/widgets/control-bar/control-bar";
import { MachineInfo } from "./machine";
import { Monochromator4CMEnergy } from "./monochromator4cm";
import { OnDemandQueueItems } from "./on-demand-queue-items";
import { VPU } from "./vpu";

export function Dashboard() {
  return (
    <>
      <ControlBar>
        <ButtonGroup>
          <EnvironmentControls />
          <QueueControls />
        </ButtonGroup>
        <ButtonGroup>
          <OnDemandQueueItems />
        </ButtonGroup>
      </ControlBar>
      <div className="flex gap-3 p-8 pt-10 pb-10 sm:flex-col lg:min-h-screen lg:flex-row">
        <ScrollArea className="h-full w-full lg:min-w-2/3">
          <CompactQueue />
        </ScrollArea>

        <div className="flex h-full flex-col gap-2 lg:w-1/2">
          <Card className="gap-2 pb-2">
            <CardHeader>
              <CardTitle>Beamline Status</CardTitle>
              <CardDescription>Current beamline conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <ItemGroup className="grid grid-cols-2 items-center">
                <Monochromator4CMEnergy />
                <MachineInfo />
                <VPU />
              </ItemGroup>
            </CardContent>
          </Card>
          <div className="flex h-62">
            <Console />
          </div>
        </div>
      </div>
    </>
  );
}
