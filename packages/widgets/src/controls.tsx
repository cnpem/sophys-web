"use client";

import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ClockAlertIcon,
  EllipsisIcon,
  ListVideoIcon,
  ListXIcon,
  MilestoneIcon,
  PauseIcon,
  RefreshCcwIcon,
  ServerIcon,
  ServerOffIcon,
  StepForwardIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { RouterOutput } from "@sophys-web/api-client/react";
import { useQueue, useStatus } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@sophys-web/ui/alert-dialog";
import { Button, buttonVariants } from "@sophys-web/ui/button";
import { ButtonGroup } from "@sophys-web/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sophys-web/ui/form";
import { Input } from "@sophys-web/ui/input";
import { Separator } from "@sophys-web/ui/separator";
import { Spinner } from "@sophys-web/ui/spinner";
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

export function Controls({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-accent animate-in slide-in-from-top fixed inset-x-0 top-2 z-40 mx-auto flex w-fit items-center justify-between gap-2 rounded-full border px-4 py-2 opacity-95 backdrop-blur-lg duration-500",
          className,
        )}
      >
        <ButtonGroup>
          <EnvironmentControls />
          <PauseControls />
          <StopControls />
          <QueueControls />
        </ButtonGroup>
        {children}
      </div>
    </TooltipProvider>
  );
}

const envDestroySchema = z.object({
  confirmation: z.string().refine((val) => val === "destroy", {
    message: 'You must type "destroy" to confirm.',
  }),
});

export function EnvironmentControls({ className }: { className?: string }) {
  const { envClose, envOpen, envUpdate, envDestroy } = useStatus();
  const { status } = useStatus();
  const combinedState = combineEnvState(
    status.data?.workerEnvironmentState,
    status.data?.managerState,
  );
  const basicUiStatus = combinedStateToBasicStatusMap[combinedState];
  const [destroyDialogOpen, setDestroyDialogOpen] = useState(false);

  const combinedStateTxt = capitalizeAndFormatState(combinedState);
  const reStateTxt = capitalizeAndFormatState(
    status.data?.reState ?? "unknown",
  );
  const workerEnvStateTxt = capitalizeAndFormatState(
    status.data?.workerEnvironmentState ?? "unknown",
  );
  const managerStateTxt = capitalizeAndFormatState(
    status.data?.managerState ?? "unknown",
  );

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
    envUpdate.mutate(undefined, {
      onError: () => {
        toast.error("Failed to update environment");
      },
    });
  }, [envUpdate]);

  const destroyEnv = useCallback(() => {
    toast.info("Destroying environment...");
    envDestroy.mutate(undefined, {
      onError: () => {
        toast.error("Failed to destroy environment");
      },
    });
  }, [envDestroy]);

  const form = useForm({
    resolver: zodResolver(envDestroySchema),
    defaultValues: {
      confirmation: "",
    },
  });

  function onSubmit() {
    destroyEnv();
    form.reset();
    setDestroyDialogOpen(false);
  }

  const onCancel = () => {
    form.reset();
    setDestroyDialogOpen(false);
  };

  return (
    <Tooltip>
      <TooltipContent
        side="left"
        sideOffset={30}
        className="mt-1 flex flex-col"
      >
        <p className="text-sm font-semibold">Server status: {combinedState}</p>
        <Separator className="mt-2 mb-2" />
        <p className="text-sm font-semibold">Worker: {workerEnvStateTxt}</p>
        <p className="text-sm font-semibold">Manager: {managerStateTxt}</p>
        <p className="text-sm font-semibold">Run Engine: {reStateTxt}</p>
      </TooltipContent>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-8 min-w-36! rounded-full",
                className,
                basicUiStatus === "online" && "text-online hover:text-online",
                basicUiStatus === "offline" &&
                  "text-offline hover:text-offline",
                basicUiStatus === "busy" && "text-busy hover:text-busy",
                basicUiStatus === "error" && "text-error hover:text-error",
              )}
            >
              {basicUiStatus === "busy" && <Spinner className="size-4" />}
              {basicUiStatus === "offline" && (
                <ServerOffIcon className="size-4 animate-pulse" />
              )}
              {basicUiStatus === "error" && (
                <ServerIcon className="size-4 animate-pulse" />
              )}
              {basicUiStatus === "online" && <ServerIcon className="size-4" />}
              {combinedStateTxt.replace("environment", "env")}
            </Button>
          </TooltipTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="text-sm"
          align="end"
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
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDestroyDialogOpen(true)}
            disabled={basicUiStatus === "offline"}
            variant="destructive"
            className="justify-stretch"
          >
            <ServerOffIcon className="size-4" />
            <span>Destroy Env</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={destroyDialogOpen} onOpenChange={setDestroyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Destroying Environment</AlertDialogTitle>
            <AlertDialogDescription>
              This action kills the current worker process as well as running
              plans or tasks. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-8"
              >
                <FormField
                  control={form.control}
                  name="confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Type "destroy" to confirm this action
                      </FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="off" />
                      </FormControl>
                      <FormDescription>
                        This action is irreversible and will stop all running
                        tasks.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex w-full justify-end gap-2">
                  <AlertDialogCancel onClick={onCancel}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className={cn(buttonVariants({ variant: "destructive" }))}
                    type="submit"
                    disabled={
                      form.formState.isSubmitting || !form.formState.isValid
                    }
                  >
                    Destroy
                  </AlertDialogAction>
                </div>
              </form>
            </Form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tooltip>
  );
}

export function QueueControls() {
  const { start, stop } = useQueue();
  const { status } = useStatus();
  const reState = status.data?.reState ?? "unknown";
  const itemsInQueue = status.data?.itemsInQueue;

  const startQueue = useCallback(() => {
    start.mutate(undefined, {
      onSuccess: () => {
        toast.success("Starting Queue...");
      },
      onError: () => {
        toast.error("Failed to start queue");
      },
    });
  }, [start]);

  const stopQueue = useCallback(() => {
    stop.mutate(undefined, {
      onSuccess: () => {
        toast.success("Stopping Queue...");
      },
      onError: () => {
        toast.error("Failed to stop queue");
      },
    });
  }, [stop]);

  if (reState === "idle" || reState === "unknown") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="h-8 rounded-full duration-300 ease-in-out"
            disabled={reState !== "idle" || itemsInQueue === 0}
            onClick={startQueue}
            variant="default"
          >
            <ListVideoIcon className="size-4" />
            Start Queue
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Start Queue</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="h-8 rounded-full duration-300 ease-in-out"
          onClick={stopQueue}
          variant="default"
          disabled={
            status.data?.managerState !== "executing_queue" ||
            status.data.queueStopPending
          }
        >
          {status.data?.queueStopPending ? (
            <Spinner />
          ) : (
            <ListXIcon className="size-4" />
          )}
          Stop Queue
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Stop Queue</TooltipContent>
    </Tooltip>
  );
}

export function PauseControls() {
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
            className="h-8 rounded-full duration-300 ease-in-out"
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
              className={cn(
                "text-destructive h-8 w-12 gap-0 duration-300 ease-in-out",
                status.data?.pausePending && "animate-pulse",
              )}
              variant="outline"
              onClick={handlePauseNow}
            >
              <PauseIcon className="size-4" />
              <ClockAlertIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Pause Now</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={cn(
                "h-8 w-12 gap-0 duration-300 ease-in-out disabled:pointer-events-auto",
                status.data?.pausePending && "animate-pulse",
              )}
              onClick={handlePauseLater}
              variant="outline"
              disabled={status.data?.pausePending}
            >
              <PauseIcon className="size-4" />
              <MilestoneIcon className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {status.data?.pausePending
              ? "Pause is scheduled..."
              : "Pause Next Checkpoint"}
          </TooltipContent>
        </Tooltip>
      </>
    );
  }
}

export function StopControls() {
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
                className="h-8 rounded-full duration-300 ease-in-out"
                size="icon"
                variant="outline"
              >
                <EllipsisIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Cancel Options</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={handleStop} className="justify-between">
            Stop item as 'stopped'
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAbort} className="justify-between">
            Stop and return item to queue as 'aborted'
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleHalt}
            variant="destructive"
            className="justify-between"
          >
            Emergency stop and return item to queue as 'halted'
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
