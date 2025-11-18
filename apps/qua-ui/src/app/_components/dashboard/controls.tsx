"use client";

import { useCallback } from "react";
import {
  PauseIcon,
  PlayIcon,
  RefreshCcwIcon,
  SkipForwardIcon,
  SquareIcon,
  StepForwardIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useQueue, useStatus } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { Button } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { Switch } from "@sophys-web/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";
import type { REState } from "~/lib/types";

function getREState(reStateStr: string | null | undefined): REState {
  if (["idle", "running", "paused", "error"].includes(reStateStr ?? "")) {
    return reStateStr as REState;
  }
  return "closed";
}

export function Controls() {
  const { status } = useStatus();
  const reState = status.isPending
    ? "unknown"
    : getREState(status.data?.reState);

  return (
    <TooltipProvider>
      <div className="animate-in slide-in-from-top bg-muted/20 fixed inset-x-0 top-1 z-40 mx-auto flex w-fit items-center justify-between gap-6 rounded-full border px-6 py-2 opacity-95 backdrop-blur-lg duration-500">
        <div className="flex flex-col items-center gap-1 p-0">
          <span
            data-re-state={reState}
            className="text-muted-foreground text-xs font-semibold data-[re-state=closed]:text-amber-400 data-[re-state=error]:text-red-400 data-[re-state=idle]:text-emerald-400 data-[re-state=paused]:text-amber-400 data-[re-state=running]:text-sky-400"
          >
            RE {reState}
          </span>
          <div className="flex items-center gap-2">
            <Environment />
            <Queue />
            <RE />
          </div>
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
        <TooltipTrigger className="flex items-center" asChild>
          <div className="inline-block">
            <Switch
              disabled={status.isPending}
              checked={isOpen}
              onClick={isOpen ? closeEnv : openEnv}
              defaultChecked={!!reState}
            />
          </div>
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
            className="size-8 rounded-full"
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
        className="size-8 rounded-full"
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
          className="size-8 rounded-full"
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
function PlaybackButton() {
  const { status } = useStatus();
  const utils = api.useUtils();
  const reState = status.isPending
    ? "unknown"
    : ((status.data?.reState ?? "closed") as REState);

  const pause = api.runEngine.pause.useMutation({
    onSettled: async () => {
      await utils.status.get.invalidate();
    },
  });

  const resume = api.runEngine.resume.useMutation({
    onSettled: async () => {
      await utils.status.get.invalidate();
    },
  });

  const handlePauseNow = useCallback(() => {
    toast.info("Pausing run engine immedeatly...");
    pause.mutate(
      { option: "immediate" },
      {
        onError: () => {
          toast.error("Failed to pause run engine");
        },
      },
    );
  }, [pause]);

  const handlePauseLater = useCallback(() => {
    toast.info("Pausing run engine after current task...");
    pause.mutate(
      { option: "deferred" },
      {
        onError: () => {
          toast.error("Failed to pause run engine");
        },
      },
    );
  }, [pause]);

  const handleResume = useCallback(() => {
    toast.info("Resuming run engine...");
    resume.mutate(undefined, {
      onError: () => {
        toast.error("Failed to resume run engine");
      },
    });
  }, [resume]);

  if (reState === "paused") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="size-8 rounded-full"
            size="icon"
            variant="outline"
            onClick={handleResume}
          >
            <StepForwardIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Resume</TooltipContent>
      </Tooltip>
    );
  }
  if (reState === "running") {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="size-8 rounded-full"
              onClick={handlePauseNow}
              size="icon"
              variant="destructive"
            >
              <PauseIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Pause Now</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="size-8 rounded-full"
              onClick={handlePauseLater}
              size="icon"
              variant="outline"
            >
              <SkipForwardIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Pause Later</TooltipContent>
        </Tooltip>
      </>
    );
  }
}

function StopButton() {
  const { status } = useStatus();
  const utils = api.useUtils();
  const reState = status.isPending
    ? "unknown"
    : ((status.data?.reState ?? "closed") as REState);

  const stop = api.runEngine.stop.useMutation({
    onSettled: async () => {
      await utils.status.get.invalidate();
    },
  });
  const halt = api.runEngine.halt.useMutation({
    onSettled: async () => {
      await utils.status.get.invalidate();
    },
  });
  const abort = api.runEngine.abort.useMutation({
    onSettled: async () => {
      await utils.status.get.invalidate();
    },
  });

  const handleStop = useCallback(() => {
    toast.info("Stopping run engine...");
    stop.mutate(undefined, {
      onError: () => {
        toast.error("Failed to stop run engine");
      },
    });
  }, [stop]);

  const handleHalt = useCallback(() => {
    toast.info("Halting run engine...");
    halt.mutate(undefined, {
      onError: () => {
        toast.error("Failed to halt run engine");
      },
    });
  }, [halt]);

  const handleAbort = useCallback(() => {
    toast.info("Aborting run engine...");
    abort.mutate(undefined, {
      onError: () => {
        toast.error("Failed to abort run engine");
      },
    });
  }, [abort]);
  if (reState === "paused") {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                className="size-8 rounded-full"
                size="icon"
                variant="outline"
              >
                <SquareIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Stop Options</TooltipContent>
        </Tooltip>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleStop}>Stop</DropdownMenuItem>
          <DropdownMenuItem onClick={handleHalt}>Halt</DropdownMenuItem>
          <DropdownMenuItem onClick={handleAbort}>Abort</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}

function RE() {
  return (
    <div className="flex items-center space-x-2">
      <PlaybackButton />
      <StopButton />
    </div>
  );
}
