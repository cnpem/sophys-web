import { useCallback } from "react";
import { ListVideoIcon, ListXIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueue, useStatus } from "@sophys-web/api-client/hooks";
import { Button } from "@sophys-web/ui/button";
import { Spinner } from "@sophys-web/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";

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
