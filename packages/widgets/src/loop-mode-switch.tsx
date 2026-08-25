import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
import { cn } from "@sophys-web/ui";
import { Field, FieldLabel } from "@sophys-web/ui/field";
import { Spinner } from "@sophys-web/ui/spinner";
import { Switch } from "@sophys-web/ui/switch";

export function LoopModeSwitch({ className }: { className?: string }) {
  const { loopMode, setLoopMode } = useQueue();

  return (
    <Field>
      <FieldLabel className="sr-only">Loop mode switch</FieldLabel>
      <div
        className={cn(
          "bg-background align-center flex h-8 flex-row items-center gap-2 rounded-full border px-2",
          className,
        )}
      >
        <Switch
          disabled={loopMode === undefined || setLoopMode.isPending}
          checked={loopMode}
          onCheckedChange={(checked) => {
            setLoopMode.mutate(
              { loop: checked },
              {
                onError: (error) => {
                  toast.error(
                    `Failed to set loop mode: ${error.message.trim()}`,
                  );
                },
              },
            );
          }}
        />
        <FieldLabel className="gap-1 text-sm whitespace-nowrap text-slate-500">
          Loop
          {setLoopMode.isPending && (
            <Spinner className="ml-2 h-4 w-4 text-slate-500" />
          )}
          {!setLoopMode.isPending && loopMode && (
            <span className="ml-2 text-slate-500">On</span>
          )}
          {!setLoopMode.isPending && !loopMode && (
            <span className="ml-2 text-slate-500">Off</span>
          )}
        </FieldLabel>
      </div>
    </Field>
  );
}
