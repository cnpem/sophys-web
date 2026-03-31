import { useCallback, useEffect, useRef } from "react";
import {
  ClockAlertIcon,
  EllipsisIcon,
  MilestoneIcon,
  OctagonXIcon,
  PauseIcon,
  SquareIcon,
  StepForwardIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { ButtonProps } from "@sophys-web/ui/button";
import { useStatus } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Button } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";

/**
 * Component that renders a button to pause the run engine immediately. On click, it triggers the pause mutation with "immediate" option and shows appropriate toast notifications based on success or failure of the action.
 */
export function PauseNowButton({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  const { status } = useStatus();
  const utils = api.useUtils();
  const pause = api.runEngine.pause.useMutation({
    onSettled: async () => {
      await utils.status.get.invalidate();
    },
  });

  const onClick = useCallback(() => {
    toast.info("Pausing run engine immediately...");
    pause.mutate(
      { option: "immediate" },
      {
        onError: () => {
          toast.error("Failed to pause run engine");
        },
      },
    );
  }, [pause]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn(
            "text-destructive h-8 w-12 gap-0 rounded-full duration-300 ease-in-out",
            status.data?.pausePending && "animate-pulse",
            className,
          )}
          variant={variant}
          onClick={onClick}
        >
          <PauseIcon className="size-4" />
          <ClockAlertIcon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Pause Now</TooltipContent>
    </Tooltip>
  );
}

/**
 * Component that renders a button to pause the run engine after the current checkpoint. On click, it triggers the pause mutation with "deferred" option and shows appropriate toast notifications based on success or failure of the action.
 */
export function PauseNextCheckpointButton({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  const { status } = useStatus();
  const utils = api.useUtils();
  const pause = api.runEngine.pause.useMutation({
    onSettled: async () => {
      await utils.status.get.invalidate();
    },
  });

  const onClick = useCallback(() => {
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

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn(
            "h-8 w-12 gap-0 rounded-full duration-300 ease-in-out disabled:pointer-events-auto",
            status.data?.pausePending && "animate-pulse",
            className,
          )}
          onClick={onClick}
          variant={variant}
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
  );
}

/**
 * Component that renders a button to resume the run engine when it is paused. On click, it triggers the resume mutation and shows appropriate toast notifications based on success or failure of the action.
 */
export function ResumeButton({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  const utils = api.useUtils();
  const resume = api.runEngine.resume.useMutation({
    onSettled: async () => {
      await utils.status.get.invalidate();
    },
  });

  const onClick = useCallback(() => {
    toast.info("Resuming run engine...");
    resume.mutate(undefined, {
      onError: () => {
        toast.error("Failed to resume run engine");
      },
    });
  }, [resume]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn(
            "h-8 rounded-full duration-300 ease-in-out",
            resume.isPending && "animate-pulse",
            className,
          )}
          disabled={resume.isPending}
          variant={variant}
          onClick={onClick}
        >
          <StepForwardIcon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Resume</TooltipContent>
    </Tooltip>
  );
}

/**
 * Component that renders stop options (stop, abort, halt) for the run engine as a dropdown menu.
 */
export function StopRunEngineOptions({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  const utils = api.useUtils();

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

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              className={cn(
                "h-8 rounded-full duration-300 ease-in-out",
                className,
              )}
              size="icon"
              variant={variant}
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

interface RunEngineControlsProps {
  buttonsClassName?: string;
  hidePauseNextCheckpoint?: boolean;
  hidePauseNow?: boolean;
}

/**
 * Component that conditionally renders all the run engine contols based on the current state of the run engine.
 */
export function RunEngineControls(options: RunEngineControlsProps) {
  const { status } = useStatus();

  const reState = status.data?.reState ?? "unknown";

  if (reState === "paused") {
    return (
      <>
        <ResumeButton className={options.buttonsClassName} />
        <StopRunEngineOptions className={options.buttonsClassName} />
      </>
    );
  }

  if (reState === "running") {
    return (
      <>
        {!options.hidePauseNow && (
          <PauseNowButton className={options.buttonsClassName} />
        )}
        {!options.hidePauseNextCheckpoint && (
          <PauseNextCheckpointButton className={options.buttonsClassName} />
        )}
      </>
    );
  }

  return null;
}

/**
 * CancelRunningItemButton works like a single action pause-now-and-stop button.
 * It should be the default option for stopping the running item when the user wants to signal a cancel action.
 *
 * It renders a button that composes the actions of the pause (now) and abort.
 * On click, it triggers the pause mutation with "immediate" option and shows appropriate toast notifications based on success or failure of the action.
 * It also watches for changes in the run engine state and triggers the abort mutation when the run engine is paused as a result of the pause action triggered by this button.
 */
export function CancelRunningItemButton({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  const pauseClickedRef = useRef(false);
  const { status } = useStatus();
  const reState = status.data?.reState ?? "unknown";
  const utils = api.useUtils();
  const pause = api.runEngine.pause.useMutation({
    onSettled: async () => {
      await utils.status.get.invalidate();
    },
  });
  const abort = api.runEngine.abort.useMutation({
    onSettled: async () => {
      await utils.status.get.invalidate();
    },
  });
  // Handle click based on current state of the run engine
  const handleClick = useCallback(() => {
    if (reState === "running") {
      toast.info("Canceling running item...");
      pauseClickedRef.current = true;
      pause.mutate(
        { option: "immediate" },
        {
          onError: () => {
            toast.error("Failed to pause run engine");
            pauseClickedRef.current = false;
          },
        },
      );
    } else if (reState === "paused") {
      toast.info("Canceling current item...");
      abort.mutate(undefined, {
        onError: () => {
          toast.error("Failed to abort current item");
        },
        onSuccess: () => {
          toast.success(
            "Running item succesfully aborted and returned to queue.",
          );
        },
      });
    }
  }, [reState, pause, abort]);

  // Watch for reState changes and trigger abort when paused
  useEffect(() => {
    if (pauseClickedRef.current && reState === "paused") {
      pauseClickedRef.current = false;
      toast.info("Aborting current item...");
      abort.mutate(undefined, {
        onError: () => {
          toast.error("Failed to abort current item");
        },
        onSuccess: () => {
          toast.success(
            "Running item succesfully aborted and returned to queue.",
          );
        },
      });
    }
  }, [reState, abort]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          className={cn(
            "h-8 w-12 rounded-full",
            ["pausing", "halting"].includes(reState) && "animate-pulse",
            pauseClickedRef.current && "animate-pulse",
            className,
          )}
          onClick={handleClick}
          disabled={!["running", "paused"].includes(reState)}
        >
          {!["pausing", "aborting"].includes(reState) && (
            <SquareIcon className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Cancel the running item. It will be stopped immediately and returned to
        the queue as 'aborted'.
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * EmergencyStopButton pauses the run engine immediately and halts the current item.
 * It renders a button that composes the actions of the pause (now) and halt.
 * On click, it triggers the pause mutation with "immediate" option and shows appropriate toast notifications based on success or failure of the action.
 * It also watches for changes in the run engine state and triggers the halt mutation when the run engine is paused as a result of the pause action triggered by this button.
 */
export function EmergencyStopButton({
  className,
  variant = "destructive",
}: {
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  const pauseClickedRef = useRef(false);
  const { status } = useStatus();
  const reState = status.data?.reState ?? "unknown";
  const utils = api.useUtils();
  const pause = api.runEngine.pause.useMutation({
    onSettled: async () => {
      await utils.status.get.invalidate();
    },
  });
  const halt = api.runEngine.halt.useMutation({
    onSettled: async () => {
      await utils.status.get.invalidate();
    },
  });
  // Handle click based on current state of the run engine
  const handleClick = useCallback(() => {
    if (reState === "running") {
      toast.warning("Triggering emergency stop for the run engine.");
      pauseClickedRef.current = true;
      pause.mutate(
        { option: "immediate" },
        {
          onError: () => {
            toast.error("Failed to pause run engine");
            pauseClickedRef.current = false;
          },
        },
      );
    } else if (reState === "paused") {
      toast.warning("Triggering emergency stop for the current item...");
      halt.mutate(undefined, {
        onError: () => {
          toast.error("Failed to halt current item");
        },
        onSuccess: () => {
          toast.success(
            "Run engine is paused and current item has been halted successfully",
          );
        },
      });
    }
  }, [reState, pause, halt]);

  // Watch for reState changes and trigger halt when paused
  useEffect(() => {
    if (pauseClickedRef.current && reState === "paused") {
      pauseClickedRef.current = false;
      halt.mutate(undefined, {
        onError: () => {
          toast.error("Failed to halt current item");
        },
        onSuccess: () => {
          toast.warning(
            "Running item has been halted. This could mean that some cleanup actions may not have been executed. Please check with the beamline staff or verify the state of the system before starting new items.",
            {
              duration: 20_000,
              closeButton: true,
            },
          );
        },
      });
    }
  }, [reState, halt]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          className={cn(
            "h-8 w-12 rounded-full",
            ["pausing", "halting"].includes(reState) && "animate-pulse",
            pauseClickedRef.current && "animate-pulse",
            className,
          )}
          onClick={handleClick}
          disabled={!["running", "paused"].includes(reState)}
        >
          {!["pausing", "halting"].includes(reState) && (
            <OctagonXIcon className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Emergency stop for the running item. May cause incomplete cleanup.
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * PauseAndPauseImmediateButton renders a single button that combines the actions of pausing the run engine as "deferred" (after current checkpoint) in the first click
 * and pausing the run engine as "immediate" in the second (or n-th) click.
 * This allows the user to have a single button for pausing the run engine with different levels of urgency based on the current state of the run engine and the number of clicks.
 * The button shows different tooltip content based on whether the pause is already scheduled or not, and also shows a pulsing animation and the pause icon is red when the pause is pending.
 */
export function PauseAndPauseImmediateButton({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  const { status } = useStatus();
  const pausePending = status.data?.pausePending ?? false;
  const reState = status.data?.reState ?? "unknown";
  const utils = api.useUtils();
  const { mutate, isPending: requestPending } = api.runEngine.pause.useMutation(
    {
      onSettled: async () => {
        await utils.status.get.invalidate();
      },
    },
  );

  const handleClick = useCallback(() => {
    if (reState !== "running") {
      toast.info(
        "The run engine is not currently running. Pause action is not applicable.",
      );
      return;
    }
    if (pausePending) {
      toast.info("Pausing run engine immediately...");
      mutate(
        { option: "immediate" },
        {
          onError: () => {
            toast.error("Failed to pause run engine");
          },
        },
      );
      return;
    }
    toast.info("Pausing run engine after current task...");
    mutate(
      { option: "deferred" },
      {
        onError: () => {
          toast.error("Failed to pause run engine");
        },
      },
    );
  }, [reState, pausePending, mutate]);

  const isAnimating =
    ["pausing", "halting"].includes(reState) || pausePending || requestPending;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          className={cn(
            "h-8 w-12 rounded-full",
            isAnimating && "animate-pulse",
            pausePending && "text-destructive",
            className,
          )}
          onClick={handleClick}
          disabled={!["running", "pausing"].includes(reState) || requestPending}
        >
          <PauseIcon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {pausePending && "Pause is scheduled... Click to pause immediately"}
        {!pausePending && "Pause the run engine."}
      </TooltipContent>
    </Tooltip>
  );
}
