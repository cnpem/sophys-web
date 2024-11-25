"use client";

import { Trash2Icon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import { ScrollArea } from "@sophys-web/ui/scroll-area";
import { toast } from "@sophys-web/ui/sonner";
import { api } from "../../trpc/react";
import { HistoryItem } from "./queue-item";

export function History() {
  const utils = api.useUtils();
  const { data } = api.history.get.useQuery(undefined, {
    refetchOnMount: "always",
  });
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
          disabled={data?.items.length === 0}
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
