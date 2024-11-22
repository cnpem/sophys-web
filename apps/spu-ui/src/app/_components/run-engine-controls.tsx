import { useCallback, useMemo } from "react";
import {
  AlertTriangle,
  ChevronDownIcon,
  Octagon,
  Pause,
  Play,
  Square,
} from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { toast } from "@sophys-web/ui/sonner";
import { useStatus } from "../_hooks/use-status";
import { api } from "../../trpc/react";

type EngineStatus = "idle" | "running" | "paused" | "unknown";
type EngineAction = "pause" | "resume" | "stop" | "halt" | "abort";

const getEngineStatus = (
  reStateStr: string | null | undefined,
): EngineStatus => {
  if (["idle", "running", "paused"].includes(reStateStr || "")) {
    return reStateStr as EngineStatus;
  }
  return "unknown";
};

function ActionButton({
  status,
  handleEngineAction,
}: {
  status: EngineStatus;
  handleEngineAction: (action: EngineAction) => Promise<void>;
}) {
  return (
    <Button
      disabled={status !== "running" && status !== "paused"}
      onClick={async () => {
        const action = status === "paused" ? "resume" : "pause";
        await handleEngineAction(action);
      }}
      variant="outline"
    >
      {status === "paused" ? (
        <Play className="mr-2 h-4 w-4" />
      ) : (
        <Pause className="mr-2 h-4 w-4" />
      )}
      {status === "paused" ? "Resume" : "Pause"}
    </Button>
  );
}

function MoreActionsDropdown({
  handleEngineAction,
}: {
  handleEngineAction: (action: EngineAction) => Promise<void>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          More
          <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleEngineAction("stop")}>
          <Square className="mr-2 h-4 w-4" />
          Stop
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEngineAction("halt")}>
          <Octagon className="mr-2 h-4 w-4" />
          Halt
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEngineAction("abort")}>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Abort
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RunEngineControls() {
  const { status: envStatus } = useStatus();
  const utils = api.useUtils();
  const pause = api.runEngine.pause.useMutation();
  const resume = api.runEngine.resume.useMutation();
  const stop = api.runEngine.stop.useMutation();
  const halt = api.runEngine.halt.useMutation();
  const abort = api.runEngine.abort.useMutation();

  const actionMap = useMemo(
    () => ({
      pause: {
        mutation: pause,
        successMessage: "Pausing run engine",
      },
      resume: {
        mutation: resume,
        successMessage: "Resuming run engine",
      },
      stop: {
        mutation: stop,
        successMessage: "Stopping run engine",
      },
      halt: {
        mutation: halt,
        successMessage: "Halting run engine",
      },
      abort: {
        mutation: abort,
        successMessage: "Aborting run engine",
      },
    }),
    [pause, resume, stop, halt, abort],
  );

  const handleEngineAction = useCallback(
    async (action: EngineAction) => {
      const actionDetails = actionMap[action];
      actionDetails.mutation.mutate(undefined, {
        onSuccess: async () => {
          toast.info(actionDetails.successMessage);
          await utils.status.get.invalidate();
        },
        onError: (error) => {
          toast.error(`Failed to ${action}: ${error.message}`);
        },
      });
      toast.info(`Submitting run engine ${action}`);
      await utils.status.get.invalidate();
    },
    [actionMap, utils.status.get],
  );

  const status = useMemo(
    () => getEngineStatus(envStatus.data?.reState),
    [envStatus.data?.reState],
  );

  return (
    <div className="flex items-center space-x-2">
      <ActionButton handleEngineAction={handleEngineAction} status={status} />
      <MoreActionsDropdown handleEngineAction={handleEngineAction} />
    </div>
  );
}
