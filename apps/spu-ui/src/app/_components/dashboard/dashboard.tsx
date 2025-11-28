"use client";

import { JsonEditor, monoLightTheme } from "json-edit-react";
import { AlertCircleIcon, CylinderIcon } from "lucide-react";
import { useQueue } from "@sophys-web/api-client/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sophys-web/ui/tabs";
import { Console } from "@sophys-web/widgets/console";
import { Controls } from "@sophys-web/widgets/controls";
import type { Sample } from "../sample";
import { useCapillaryState } from "~/app/_hooks/use-capillary-state";
import { useSSEData } from "~/app/_hooks/use-sse-data";
import { trayOptions } from "~/lib/constants";
import { DataTable as History } from "../history/data-table";
import { DataTable as Queue } from "../queue/data-table";
import { LoadingTray, Tray } from "../tray";
import { SampleTemperatureMonitor } from "./sample-temperature";

const [TRAY1, TRAY2] = trayOptions;

export function Dashboard({ initialData }: { initialData: Sample[] }) {
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
            <PV />
            <RunningItem />
            <Trays initialData={initialData} />
            <Console />
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

function Trays({ initialData }: { initialData: Sample[] }) {
  const { data: samples, isConnected } = useSSEData<Sample[]>("/api/samples", {
    initialData,
  });
  return (
    <>
      {isConnected ? (
        <Tabs className="space-y-2" defaultValue="tray1">
          <TabsContent value="tray1">
            <Tray
              samples={
                samples?.filter((sample) => sample.tray === TRAY1) ??
                initialData.filter((sample) => sample.tray === TRAY1)
              }
            />
          </TabsContent>
          <TabsContent value="tray2" className="mt-0">
            <Tray
              samples={
                samples?.filter((sample) => sample.tray === TRAY2) ??
                initialData.filter((sample) => sample.tray === TRAY2)
              }
            />
          </TabsContent>
          <TabsList>
            <TabsTrigger value="tray1">Tray 1</TabsTrigger>
            <TabsTrigger value="tray2">Tray 2</TabsTrigger>
          </TabsList>
        </Tabs>
      ) : (
        <LoadingTray />
      )}
    </>
  );
}

function RunningItem() {
  const { queue } = useQueue();
  const runningItem = queue.data?.runningItem;

  if (!runningItem || Object.keys(runningItem).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Running Item</CardTitle>
          <CardDescription>Currently running task</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircleIcon className="text-muted-foreground mb-2 size-10" />
            <p className="text-muted-foreground">No task currently running</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Running Item</CardTitle>
        <CardDescription>Currently running task</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">
              {runningItem.name.replace(/_/g, " ")}
            </h3>
            <p className="text-muted-foreground">{runningItem.user}</p>
          </div>
          {runningItem.kwargs && (
            <div>
              <h3>Parameters</h3>
              <JsonEditor
                restrictAdd={true}
                restrictDelete={true}
                restrictEdit={true}
                restrictDrag={true}
                data={runningItem.kwargs}
                rootName={"kwargs"}
                theme={monoLightTheme}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PV() {
  const { capillaryState } = useCapillaryState();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Variables</CardTitle>
        <CardDescription>Current environmental conditions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <SampleTemperatureMonitor />
          <div className="flex items-center rounded-md border p-3">
            <CylinderIcon className="mr-3 h-8 w-8 text-blue-500" />
            <div>
              <div className="text-muted-foreground text-sm">Capillary</div>
              <div
                data-state={capillaryState}
                className="text-2xl font-semibold data-[state=clean]:text-emerald-400 data-[state=error]:text-red-400 data-[state=sample]:text-sky-400 data-[state=stale]:text-amber-400"
              >
                {capillaryState}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
