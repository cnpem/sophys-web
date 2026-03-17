import { useCallback } from "react";
import {
  ClockAlertIcon,
  EllipsisIcon,
  MilestoneIcon,
  PauseIcon,
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
          className={cn("h-8 rounded-full duration-300 ease-in-out", className)}
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
