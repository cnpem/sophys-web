"use client";

import { useCallback } from "react";
import {
  LoaderCircleIcon,
  PauseIcon,
  PlayIcon,
  RefreshCcwIcon,
  ServerIcon,
  ServerOffIcon,
  SquareIcon,
  StepForwardIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { RouterOutput } from "@sophys-web/api-client/react";
import { useQueue, useStatus } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { Separator } from "@sophys-web/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";

type BasicUiStatus = "online" | "offline" | "busy" | "error";
type WorkerEnvironmentState =
  RouterOutput["status"]["get"]["workerEnvironmentState"];
type ManagerState = RouterOutput["status"]["get"]["managerState"];
type CombinedEnvState = "unknown" | WorkerEnvironmentState | ManagerState;

const combinedStateToBasicStatusMap: Record<CombinedEnvState, BasicUiStatus> = {
  initializing: "busy",
  executing_plan: "busy",
  executing_task: "busy",
  closing: "busy",
  paused: "busy",
  creating_environment: "busy",
  starting_queue: "busy",
  executing_queue: "busy",
  closing_environment: "busy",
  destroying_environment: "busy",
  unknown: "error",
  failed: "error",
  idle: "online",
  closed: "offline",
};

function capitalizeAndFormatState(state: string) {
  return state.charAt(0).toUpperCase() + state.slice(1).replaceAll("_", " ");
}

function combineEnvState(
  workerEnvState?: WorkerEnvironmentState,
  managerState?: ManagerState,
) {
  if (!workerEnvState) return "unknown";
  if (!managerState) return "unknown";
  if ("idle" === managerState) return workerEnvState;
  return managerState;
}

export function Controls({ className }: { className?: string }) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-accent animate-in slide-in-from-top fixed inset-x-0 top-1 z-40 mx-auto flex w-fit items-center justify-between gap-2 rounded-full border px-6 py-2 opacity-95 backdrop-blur-lg duration-500",
          className,
        )}
      >
        <EnvironmentControls />
        <QueueControls />
        <PauseControls />
        <StopControls />
      </div>
    </TooltipProvider>
  );
}

function EnvironmentControls() {
  const { envClose, envOpen, envUpdate } = useStatus();
  const { status } = useStatus();
  const combinedState = combineEnvState(
    status.data?.workerEnvironmentState,
    status.data?.managerState,
  );
  const basicUiStatus = combinedStateToBasicStatusMap[combinedState];

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
    <Tooltip>
      <TooltipContent
        side="left"
        sideOffset={30}
        className="mt-1 flex flex-col"
      >
        <p className="text-sm font-semibold">Server status: {combinedState}</p>
        <Separator className="mt-2 mb-2" />
        <p className="text-sm font-semibold">
          Worker:{" "}
          {capitalizeAndFormatState(
            status.data?.workerEnvironmentState ?? "unknown",
          )}
        </p>
        <p className="text-sm font-semibold">
          Manager:{" "}
          {capitalizeAndFormatState(status.data?.managerState ?? "unknown")}
        </p>
        <p className="text-sm font-semibold">
          Run Engine:{" "}
          {capitalizeAndFormatState(status.data?.reState ?? "unknown")}
        </p>
      </TooltipContent>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-72! rounded-full",
                basicUiStatus === "online" && "text-online hover:text-online",
                basicUiStatus === "offline" &&
                  "text-offline hover:text-offline",
                basicUiStatus === "busy" && "text-busy hover:text-busy",
                basicUiStatus === "error" && "text-error hover:text-error",
              )}
            >
              {basicUiStatus === "busy" && (
                <LoaderCircleIcon className="size-4 animate-spin" />
              )}
              {basicUiStatus === "offline" && (
                <ServerOffIcon className="size-4 animate-pulse" />
              )}
              {basicUiStatus === "error" && (
                <ServerIcon className="size-4 animate-pulse" />
              )}
              {basicUiStatus === "online" && <ServerIcon className="size-4" />}
              {capitalizeAndFormatState(combinedState)}
            </Button>
          </TooltipTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="text-sm"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuItem
            onClick={updateEnv}
            disabled={basicUiStatus === "busy"}
            className="text-muted-foreground justify-stretch"
          >
            <RefreshCcwIcon className="size-4" />
            Reload Env
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={openEnv}
            className="justify-stretch text-green-400!"
            disabled={basicUiStatus !== "offline"}
          >
            <ServerIcon className="size-4" />
            <span>Open Env</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={closeEnv}
            disabled={basicUiStatus === "busy" || basicUiStatus === "offline"}
            variant="destructive"
            className="justify-stretch"
          >
            <ServerOffIcon className="size-4" />
            <span>Close Env</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Tooltip>
  );
}

function QueueControls() {
  const { start, stop } = useQueue();
  const { status } = useStatus();
  const reState = status.data?.reState ?? "unknown";
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

  if (reState === "paused") {
    //
    return;
  }

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

function PauseControls() {
  const { status } = useStatus();
  const utils = api.useUtils();
  const reState = status.data?.reState ?? "unknown";

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
              <TriangleAlertIcon className="size-4" />
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
              <PauseIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Pause Later</TooltipContent>
        </Tooltip>
      </>
    );
  }
}

function StopControls() {
  const { status } = useStatus();
  const utils = api.useUtils();
  const reState = status.data?.reState ?? "unknown";

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
