"use client";

import { useCallback } from "react";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
import { Button } from "@sophys-web/ui/button";
import { OnDemandSelector } from "../on-demand/on-demand-queue-items";
import { UploadQueue } from "./upload";

function ClearQueue() {
  const { clear } = useQueue();
  const clearQueue = useCallback(() => {
    clear.mutate(undefined, {
      onSuccess: () => {
        toast.success("Queue cleared");
      },
      onError: () => {
        toast.error("Failed to clear queue");
      },
    });
  }, [clear]);
  return (
    <Button variant="ghost" size="sm" onClick={clearQueue}>
      <XIcon className="size-4" />
      Clear Queue
    </Button>
  );
}

export function TableTools() {
  return (
    <div className="mx-auto flex flex-1 items-center">
      <UploadQueue />
      <OnDemandSelector />
      <ClearQueue />
    </div>
  );
}
