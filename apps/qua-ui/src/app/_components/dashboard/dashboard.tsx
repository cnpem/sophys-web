"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { Console } from "@sophys-web/widgets/console";
import { Controls } from "@sophys-web/widgets/controls";
import { DataTable as History } from "../history/data-table";
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
                <CardTitle>Queue</CardTitle>
                <CardDescription>Current tasks in the queue</CardDescription>
              </CardHeader>
              <CardContent>
                <Queue />
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
        <ScrollArea className="flex flex-col lg:h-svh lg:w-1/3">
          <div className="flex w-full flex-col gap-4">
            <RunningItem />
            <Console />
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
