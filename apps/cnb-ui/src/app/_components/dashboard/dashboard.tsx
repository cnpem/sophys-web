"use client";

import { useQueue } from "@sophys-web/api-client/hooks";
import { cn } from "@sophys-web/ui";
import { ButtonGroup } from "@sophys-web/ui/button-group";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { CompactQueue } from "@sophys-web/widgets/compact-queue";
import { Console } from "@sophys-web/widgets/console";
import {
  ControlBar,
  EnvironmentControls,
  QueueControls,
} from "@sophys-web/widgets/control-bar/control-bar";
import { OnDemandQueueItems } from "./on-demand-queue-items";

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
      <div className="flex gap-2 p-2 pt-16 sm:flex-col lg:flex-row">
        <ScrollArea className="w-full lg:h-svh lg:min-w-2/3">
          <div className="flex flex-col gap-2">
            <CompactQueue />
            <Console />
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
