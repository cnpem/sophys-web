"use client";

import { useQueue, useStatus } from "@sophys-web/api-client/hooks";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import type { REState } from "~/lib/types";
import { useCapillaryState } from "~/app/_hooks/use-capillary-state";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-bl lg:px-6">
      <RunEngine />
      <RunningItem />
      <Capillary />
      <Temperature />
    </div>
  );
}

function Temperature() {
  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>Temperature</CardDescription>
        <CardTitle className="@[250px]/card:text-2xl text-3xl font-semibold tabular-nums">
          25.0 °C (or not)
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="text-muted-foreground">TO BE IMPLEMENTED</div>
      </CardFooter>
    </Card>
  );
}

function Capillary() {
  const { capillaryState, loadedSample } = useCapillaryState();

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>Capillary</CardDescription>
        <CardTitle
          data-state={capillaryState}
          className="@[250px]/card:text-2xl text-3xl font-semibold tabular-nums data-[state=clean]:text-emerald-400 data-[state=error]:text-red-400 data-[state=sample]:text-sky-400 data-[state=stale]:text-amber-400"
        >
          {capillaryState}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        {loadedSample && (
          <p className="text-muted-foreground space-x-2 text-sm">
            <span>Loaded Sample:</span>
            <span className="font-semibold">{`${loadedSample.tray}, ${loadedSample.row}-${loadedSample.col},`}</span>
            <span>{`type: ${loadedSample.sampleType},`}</span>
            <span>{`tag: "${loadedSample.sampleTag}",`}</span>
            <span>
              {loadedSample.bufferTag
                ? `buffer: "${loadedSample.bufferTag}"`
                : ""}
            </span>
          </p>
        )}
      </CardFooter>
    </Card>
  );
}

function RunEngine() {
  const { status } = useStatus();
  const data = status.data;
  const reState = status.isPending
    ? "unknown"
    : ((status.data?.reState ?? "closed") as REState);
  if (status.isPending) {
    return (
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Run Engine</CardDescription>
          <CardTitle className="@[250px]/card:text-2xl text-3xl font-semibold tabular-nums">
            Unknown
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>Run Engine</CardDescription>
        <CardTitle
          data-re-state={reState}
          className="text-muted-foreground @[250px]/card:text-2xl text-3xl font-semibold tabular-nums data-[re-state=closed]:text-amber-400 data-[re-state=error]:text-red-400 data-[re-state=idle]:text-emerald-400 data-[re-state=paused]:text-amber-400 data-[re-state=running]:text-sky-400"
        >
          {reState}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {data?.msg ?? "No message"}
        </div>
        <div className="text-muted-foreground">
          {data?.itemsInQueue} items in queue
        </div>
        <div className="text-muted-foreground">
          {data?.itemsInHistory} items in history
        </div>
      </CardFooter>
    </Card>
  );
}

function RunningItem() {
  const { queue } = useQueue();
  const runningItem = queue.data?.runningItem;
  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>Running Item</CardDescription>
        <CardTitle className="@[250px]/card:text-2xl overflow-auto text-3xl font-semibold tabular-nums">
          {runningItem?.name ?? "No item running"}
        </CardTitle>
      </CardHeader>
      <CardFooter className="text-muted-foreground flex-col items-start gap-1 text-sm">
        <span>{runningItem?.user ?? "Start the queue first"}</span>
        {runningItem?.kwargs && (
          <pre>{JSON.stringify(runningItem.kwargs, null, 2)}</pre>
        )}
      </CardFooter>
    </Card>
  );
}
