"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sophys-web/ui/tabs";
import type { Sample } from "./sample";
import { useSSEData } from "../_hooks/use-sse-data";
import { trayOptions } from "../../lib/constants";
import { Console } from "./console";
import { ControlPlane } from "./control-plane";
import { Queue } from "./queue/queue";
import { Tray } from "./tray";

const [TRAY1, TRAY2] = trayOptions;

export function samplePosition(row: string, col: number, tray: string) {
  const colRepr = col.toString().padStart(2, "0");
  const relative = `${colRepr}${row}`;
  return {
    complete: `${tray}-${relative}`,
    relative,
  };
}

export default function Experiment({
  initialSamples,
}: {
  initialSamples?: Sample[];
}) {
  const [samples] = useSSEData("/api/samples", {
    initialData: initialSamples,
  });

  return (
    <div className="flex h-screen w-screen flex-row items-start justify-center gap-4 p-8">
      <div className="flex flex-col gap-4">
        <Tabs className="space-y-2" defaultValue="tray1">
          <TabsContent value="tray1" className="mt-0">
            <Tray
              activeId={null}
              samples={samples?.filter((sample) => sample.tray === TRAY1) ?? []}
            />
          </TabsContent>
          <TabsContent value="tray2" className="mt-0">
            <Tray
              activeId={null}
              samples={samples?.filter((sample) => sample.tray === TRAY2) ?? []}
            />
          </TabsContent>
          <TabsList>
            <TabsTrigger value="tray1">Tray 1</TabsTrigger>
            <TabsTrigger value="tray2">Tray 2</TabsTrigger>
          </TabsList>
        </Tabs>
        <Console className="min-h-72 w-full rounded-md" />
      </div>
      <div className="flex w-2/3 flex-col items-start justify-center gap-4">
        <ControlPlane />
        <Queue />
      </div>
    </div>
  );
}
