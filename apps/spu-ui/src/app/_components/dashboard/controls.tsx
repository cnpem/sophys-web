import { useCallback } from "react";
import { PauseIcon, PlayIcon, RefreshCcwIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueue, useStatus } from "@sophys-web/api-client/hooks";
import { Button } from "@sophys-web/ui/button";
import { Switch } from "@sophys-web/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";
import type { REState } from "~/lib/types";
import { RunEngineControls } from "../run-engine-controls";

export function Controls() {
  const { status } = useStatus();
  const reState = status.isPending
    ? "unknown"
    : ((status.data?.reState ?? "closed") as REState);

  return (
    <TooltipProvider>
      <div className="animate-in slide-in-from-top bg-muted/20 fixed inset-x-0 top-1 z-40 mx-auto flex w-fit items-center justify-between gap-6 rounded-full border px-6 py-2 opacity-95 backdrop-blur-lg duration-500">
        <div className="flex flex-col items-center gap-1 p-0 ">
          <span
            data-re-state={reState}
            className="text-muted-foreground text-xs font-semibold data-[re-state=closed]:text-amber-400 data-[re-state=error]:text-red-400 data-[re-state=idle]:text-emerald-400 data-[re-state=paused]:text-amber-400 data-[re-state=running]:text-sky-400"
          >
            RE {reState}
          </span>
          <Environment />
        </div>

        <div className="flex flex-col items-center p-0">
          <span className="text-muted-foreground text-xs">Queue</span>
          <Queue />
        </div>

        <div className="flex flex-col items-center p-0">
          <span className="text-muted-foreground text-xs">Actions</span>
          <RunEngineControls />
        </div>
      </div>
    </TooltipProvider>
  );
}

function Environment() {
  const { envClose, envOpen, envUpdate } = useStatus();
  const { status } = useStatus();
  const reState = status.isPending
    ? "unknown"
    : ((status.data?.reState ?? "closed") as REState);
  const isOpen = reState !== "closed" && reState !== "unknown";

  const openEnv = useCallback(() => {
    toast.info("Opening environment...");
    envOpen.mutate(undefined, {
      onError: () => {
        toast.error("Failed to open environment");
      },
    });
  }, [envOpen]);

  const closeEnv = useCallback(() => {
    toast.info("Closing environment...");
    envClose.mutate(undefined, {
      onError: () => {
        toast.error("Failed to close environment");
      },
    });
  }, [envClose]);
  const updateEnv = useCallback(() => {
    toast.info("Updating environment...");
    envUpdate.mutate();
  }, [envUpdate]);

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="size-7 rounded-full"
            disabled={isOpen}
            onClick={updateEnv}
            size="icon"
            variant="outline"
          >
            <RefreshCcwIcon className="size-4" />
          </Button>
        </TooltipTrigger>

        <TooltipContent side="bottom">Update Environment</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger className="flex items-center">
          <Switch
            disabled={status.isPending}
            checked={isOpen}
            onClick={isOpen ? closeEnv : openEnv}
            defaultChecked={!!reState}
          />
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isOpen ? "Close Environment" : "Open Environment"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function Queue() {
  const { start, stop } = useQueue();
  const { status } = useStatus();
  const reState = status.isPending
    ? "unknown"
    : ((status.data?.reState ?? "closed") as REState);
  const itemsInQueue = status.data?.itemsInQueue;

  const startQueue = useCallback(() => {
    start.mutate(undefined, {
      onSuccess: () => {
        toast.success("Queue started");
      },
      onError: () => {
        toast.error("Failed to start queue");
      },
    });
  }, [start]);

  const stopQueue = useCallback(() => {
    stop.mutate(undefined, {
      onSuccess: () => {
        toast.success("Queue stopped");
      },
      onError: () => {
        toast.error("Failed to stop queue");
      },
    });
  }, [stop]);

  if (reState === "running") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="rounded-full"
            onClick={stopQueue}
            size="icon"
            variant="default"
          >
            <SquareIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Stop Queue</TooltipContent>
      </Tooltip>
    );
  }

  if (reState === "paused") {
    return (
      <Button
        className="rounded-full"
        disabled
        size="icon"
        variant="destructive"
      >
        <PauseIcon className="size-4" />
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="size-7 rounded-full"
          disabled={reState !== "idle" || itemsInQueue === 0}
          onClick={startQueue}
          size="icon"
          variant="default"
        >
          <PlayIcon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Start Queue</TooltipContent>
    </Tooltip>
  );
}
