"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { CompactQueue } from "@sophys-web/widgets/compact-queue";
import { Console } from "@sophys-web/widgets/console";
import { Controls } from "@sophys-web/widgets/controls";
import { DataTable as History } from "../history/data-table";
import { PrefectRunsTable } from "../prefect/artifacts";
import { DataTable as Queue } from "../queue/data-table";
import { RunningItem } from "./running-item";

export function Dashboard() {
  return (
    <>
      <Controls />
      <div className="flex gap-2 p-8 sm:flex-col lg:flex-row">
        <ScrollArea className="lg:h-svh lg:w-2/3">
          <div className="flex flex-col gap-4">
            <Card id="queue">
              <CardHeader>
                <CardTitle>Experimental Procedures</CardTitle>
                <CardDescription>Current tasks in the queue</CardDescription>
              </CardHeader>
              <CardContent>
                <CompactQueue />
              </CardContent>
              <CardContent>
                <Console />
              </CardContent>
            </Card>

            <Card id="prefect">
              <CardHeader>
                <CardTitle>Post-processing results</CardTitle>
                <CardDescription>Current preefect flows</CardDescription>
              </CardHeader>
              <CardContent>
                <PrefectRunsTable />
              </CardContent>
            </Card>
            <Card id="history">
              <CardHeader>
                <CardTitle>History</CardTitle>
                <CardDescription>
                  Concluded tasks and their results
                </CardDescription>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          </div>
        </ScrollArea>
        <ScrollArea className="flex flex-col lg:h-svh lg:w-1/3">
          <div className="flex w-full flex-col gap-4">
            <RunningItem />
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
