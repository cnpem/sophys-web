"use client";

import { Trash2Icon } from "lucide-react";
import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import { Button } from "@sophys-web/ui/button";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { toast } from "@sophys-web/ui/sonner";
import type { HistoryItemProps } from "../../lib/types";
import { kwargsResponseSchema } from "../../lib/schemas/acquisition";
import { api } from "../../trpc/react";

function HistoryItem({ props }: { props: HistoryItemProps }) {
  const { data: planParams } = kwargsResponseSchema.safeParse(props.kwargs);
  const status = function () {
    // how can I get the running item?
    if (!props.result) {
      return "oops";
    }
    if (props.result.traceback) {
      return "failed";
    }
    return "completed";
  };

  return (
    <li className="w-fill flex select-none items-center justify-between space-x-2 rounded-md bg-gray-50 p-3 shadow-md">
      <div className="flex flex-grow items-center space-x-3">
        <div
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-full font-bold text-white",
            {
              "bg-gray-500": !planParams,
              "bg-emerald-500": planParams?.sampleType === "sample",
              "bg-sky-500": planParams?.sampleType === "buffer",
            },
          )}
        >
          {planParams ? `${planParams.col}${planParams.row}` : "N/A"}
          <span className="absolute bottom-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-white text-xs text-black">
            {planParams ? planParams.sampleType.toUpperCase()[0] : "-"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {planParams ? (
            <div className="flex flex-col">
              <p className="font-bold">{planParams.sampleTag}</p>
              <p className="text-sm text-muted-foreground">
                {`${planParams.tray} |`}
                {planParams.sampleType !== "buffer" &&
                  ` buffer: ${planParams.bufferTag} |`}
                {` user: ${props.user}`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              <p className="font-bold">{`${props.name}`}</p>
              <p className="text-sm text-muted-foreground">
                {` user: ${props.user}`}
              </p>
            </div>
          )}
        </div>
        <Badge variant="outline">{status()}</Badge>
      </div>
    </li>
  );
}

export function History() {
  const utils = api.useUtils();
  const { data } = api.history.get.useQuery(undefined, {});
  const { mutate } = api.history.clear.useMutation({
    onSuccess: async () => {
      toast.success("Queue cleared.");
      await utils.history.invalidate();
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-center gap-2">
        <h1 className="mr-auto text-lg font-medium">Experiment History</h1>

        <Button
          onClick={() => {
            mutate();
          }}
          variant="outline"
        >
          <Trash2Icon className="mr-2 h-4 w-4" />
          Clear History
        </Button>
      </div>
      <div className="relative flex h-fit w-full items-center justify-center rounded-lg border-2 border-muted p-4 font-medium">
        <ScrollArea className="flex h-[calc(100vh-480px)] w-full flex-col">
          {data?.items.length === 0 ? (
            <p className="text-center text-muted-foreground">
              History is empty.
            </p>
          ) : (
            <ul className="space-y-2">
              {data?.items.map((item) => (
                <HistoryItem key={item.itemUid} props={item} />
              ))}
            </ul>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
