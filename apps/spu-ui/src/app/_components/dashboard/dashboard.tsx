"use client";

import { ButtonGroup } from "@sophys-web/ui/button-group";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { CompactQueue } from "@sophys-web/widgets/compact-queue";
import { Console } from "@sophys-web/widgets/console";
import {
  ControlBar,
  EnvironmentControls,
  QueueControls,
} from "@sophys-web/widgets/control-bar/control-bar";
import { OnDemandSelector } from "../plans/on-demand-queue-items";
import { CustomRunningItem } from "./custom-running-item";
import { ExperimentalEnvironment } from "./experimental-environment";

export function Dashboard() {
  return (
    <>
      <ControlBar>
        <ButtonGroup>
          <EnvironmentControls />
          <QueueControls />
        </ButtonGroup>
        <ButtonGroup>
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
          <ExperimentalEnvironment />
        </ScrollArea>
      </div>
    </>
  );
}
