"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sophys-web/ui/tabs";
import type { Sample } from "./sample";
import { useSSEData } from "../_hooks/use-sse-data";
import { trayOptions } from "../../lib/constants";
import { Console } from "./console";
import { ControlPlane } from "./control-plane";
import { Queue } from "./queue/queue";
import { LoadingTray, Tray } from "./tray";

const [TRAY1, TRAY2] = trayOptions;

export function samplePosition(row: string, col: number, tray: string) {
  const colRepr = col.toString().padStart(2, "0");
  const relative = `${colRepr}${row}`;
  return {
    complete: `${tray}-${relative}`,
    relative,
  };
}

export default function Experiment({ initialData }: { initialData: Sample[] }) {
  const { data: samples, isConnected } = useSSEData<Sample[]>("/api/samples", {
    initialData,
  });

  return (
    <div className="flex h-screen items-start justify-center gap-4 p-6">
      <div className="flex max-w-md flex-col gap-4">
        {isConnected ? (
          <Tabs className="space-y-2" defaultValue="tray1">
            <TabsContent value="tray1" className="mt-0">
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
        <Console className="h-72 w-full rounded-md" />
      </div>
      <div className="flex flex-col items-start justify-center gap-4">
        <ControlPlane />
        <Queue />
      </div>
    </div>
  );
}
