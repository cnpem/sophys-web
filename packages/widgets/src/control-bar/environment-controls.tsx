import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCcwIcon, ServerIcon, ServerOffIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { RouterOutput } from "@sophys-web/api-client/react";
import { useStatus } from "@sophys-web/api-client/hooks";
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
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";

type BasicUiStatus = "online" | "offline" | "busy" | "error";
type WorkerEnvironmentState =
  RouterOutput["httpserver"]["status"]["get"]["workerEnvironmentState"];
type ManagerState = RouterOutput["httpserver"]["status"]["get"]["managerState"];
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
            <span>Reload Env</span>
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
