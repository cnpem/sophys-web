import { toast } from "sonner";
import { useStatus } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import { cn } from "@sophys-web/ui";
import { Field, FieldLabel } from "@sophys-web/ui/field";
import { Spinner } from "@sophys-web/ui/spinner";
import { Switch } from "@sophys-web/ui/switch";

export function LoopModeSwitch({ className }: { className?: string }) {
  const utils = api.useUtils();
  const { status } = useStatus();
  const { mutate: mutateLoopMode, isPending } =
    api.httpserver.queue.mode.set.useMutation({
      /** Optimistic updates */
      onMutate: async ({
        loop = false,
        ignoreFailures = false,
      }: {
        loop?: boolean;
        ignoreFailures?: boolean;
      }) => {
        await utils.httpserver.status.get.cancel();
        const previousValue = utils.httpserver.status.get.getData();
        utils.httpserver.status.get.setData(undefined, (current) => {
          if (!current) return current;

          return {
            ...current,
            planQueueMode: {
              ...current.planQueueMode,
              ignoreFailures,
              loop,
            },
          };
        });
        return { previousValue };
      },
      onError: (error, _variables, context) => {
        // rollback to the previous value
        utils.httpserver.status.get.setData(undefined, context?.previousValue);
        toast.error(error.message.trim().replace(/\n/g, " "));
      },
    });

  const loopMode = status.data?.planQueueMode.loop;

  return (
    <Field>
      <FieldLabel className="sr-only">Loop</FieldLabel>
      <div
        className={cn(
          "bg-background align-center flex h-8 flex-row items-center gap-2 rounded-full border px-2",
          className,
        )}
      >
        <Switch
          disabled={
            isPending ||
            status.isLoading ||
            status.isError ||
            status.data?.reState !== "idle"
          }
          checked={loopMode}
          onCheckedChange={(checked) => {
            mutateLoopMode({ loop: checked });
          }}
        />
        <FieldLabel className="gap-1 text-sm whitespace-nowrap text-slate-500">
          Loop
          {isPending && <Spinner className="ml-2 h-4 w-4 text-slate-500" />}
          {!isPending && loopMode && (
            <span className="ml-2 text-slate-500">On</span>
          )}
          {!isPending && !loopMode && (
            <span className="ml-2 text-slate-500">Off</span>
          )}
        </FieldLabel>
      </div>
    </Field>
  );
}
