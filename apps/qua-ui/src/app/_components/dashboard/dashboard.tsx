"use client";

import { ButtonGroup } from "@sophys-web/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { Console } from "@sophys-web/widgets/console";
import {
  ControlBar,
  EnvironmentControls,
  QueueControls,
} from "@sophys-web/widgets/control-bar/control-bar";
import { DataTable as History } from "@sophys-web/widgets/history-table/data-table";
import { FinishedItemAlertDialog } from "../history/finished-item-alert-dialog";
import { InSituSelector } from "../insitu/insitu-items";
import { CustomQueueTable } from "../queue/custom-queue";
import { CustomRunningItem } from "../queue/custom-running-item";
// import { NewItemSearchDialog } from "../queue/new-item-search";
import { OnDemandQueueItems } from "../queue/on-demand-queue-items";
import { ScanSelector } from "../scans/scans-items";
import { BeamlineStates } from "./beamline-states";

export function Dashboard() {
  return (
    <div className="flex h-screen flex-col">
      <FinishedItemAlertDialog />
      <ControlBar>
        <ButtonGroup>
          <EnvironmentControls />
          <QueueControls />
        </ButtonGroup>
        <ButtonGroup>
          <ScanSelector />
          <InSituSelector />
          {/* <NewItemSearchDialog /> */}
          <OnDemandQueueItems />
        </ButtonGroup>
      </ControlBar>
      <div className="flex gap-2 px-8 pt-8 pb-2 sm:flex-col lg:flex-row">
        <ScrollArea className="lg:h-[calc(100vh-3rem)] lg:w-2/3">
          <div className="flex flex-col gap-2">
            <Card id="queue">
              <CardHeader>
                <CardTitle>Experimental Procedures</CardTitle>
                <CardDescription>Current tasks in the queue</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <CustomRunningItem />
                <CustomQueueTable />
              </CardContent>
            </Card>
            <Card id="history">
              <CardHeader>
                <CardTitle>History</CardTitle>
                <CardDescription>
                  Concluded tasks and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <History />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        <div className="flex flex-col gap-2 lg:w-1/3">
          <BeamlineStates />
          <Console />
        </div>
      </div>
    </div>
  );
}
