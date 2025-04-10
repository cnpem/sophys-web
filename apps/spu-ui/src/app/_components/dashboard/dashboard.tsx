"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sophys-web/ui/tabs";
import type { Sample } from "../sample";
import { useSSEData } from "~/app/_hooks/use-sse-data";
import { trayOptions } from "~/lib/constants";
import { Console } from "../console";
import { DataTable as History } from "../history/data-table";
import { DataTable as Queue } from "../queue/data-table";
import { LoadingTray, Tray } from "../tray";
import { SectionCards } from "./cards";
import { Controls } from "./controls";

const [TRAY1, TRAY2] = trayOptions;

export function Dashboard({ initialData }: { initialData: Sample[] }) {
  return (
    <div className="flex flex-1 flex-col p-24">
      <Controls />
      <div className="@container/main flex flex-1 flex-col gap-4">
        <SectionCards />
        <div className="flex h-[40rem] flex-row gap-4 border p-4 shadow-sm">
          <Trays initialData={initialData} />
          <Console className="h-full flex-1" />
        </div>
        <div className="flex flex-col gap-4 rounded-md border p-4 shadow-sm">
          <h1 id="queue" className="text-2xl font-normal">
            Queue
          </h1>
          <Queue />
        </div>
        <div className="flex flex-col gap-4 rounded-md border p-4 shadow-sm">
          <h1 id="history" className="text-2xl font-normal">
            History
          </h1>
          <History />
        </div>
      </div>
    </div>
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
          <TabsContent value="tray1" className="mt-0 *:data-[slot=card]:pt-0">
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
