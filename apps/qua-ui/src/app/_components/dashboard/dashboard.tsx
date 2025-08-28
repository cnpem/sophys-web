"use client";

import { useEffect, useRef } from "react";
import { JsonEditor, monoLightTheme } from "json-edit-react";
import { AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { Console } from "@sophys-web/widgets/console";
import { DataTable as History } from "../history/data-table";
import { DataTable as Queue } from "../queue/data-table";
import { Controls } from "./controls";

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

function RunningItem() {
  const { queue } = useQueue();
  const runningItem = queue.data?.runningItem;
  const prevRunningItemRef = useRef(runningItem);

  useEffect(() => {
    // If previously there was a running item, and now it's empty, show toast
    const prev = prevRunningItemRef.current;
    const prevExists = prev && Object.keys(prev).length > 0;
    const nowEmpty = !runningItem || Object.keys(runningItem).length === 0;
    if (prevExists && nowEmpty) {
      toast.message("Plan finished", {
        icon: <AlertCircleIcon />,
        description: (
          <div className="text-accent-foreground">
            {prev.name}
            {Object.keys(prev.kwargs ?? {}).length > 0 && (
              <div className="mt-2">
                <h3 className="mb-2 font-medium">Parameters</h3>
                <pre className="overflow-y-auto rounded p-2 break-words whitespace-pre-wrap">
                  {JSON.stringify(prev.kwargs, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ),
        duration: Infinity,
        closeButton: true,
        classNames: {
          toast: "!bg-green-100",
          icon: "animate-bounce",
        },
      });
    }
    prevRunningItemRef.current = runningItem;
  }, [runningItem]);

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
