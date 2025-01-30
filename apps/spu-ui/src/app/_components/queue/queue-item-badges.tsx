import { z } from "zod";
import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import type { QueueItemProps } from "../../../lib/types";

const commonKwargsSchema = z.object({
  proposal: z.string().optional(),
  tray: z.string().optional(),
  col: z.string().optional(),
  row: z.string().optional(),
  sampleType: z.string().optional(),
  sampleTag: z.string().optional(),
  metadata: z
    .object({
      sampleType: z.string().optional(),
      sampleTag: z.string().optional(),
      bufferTag: z.string().optional(),
      row: z.string().optional(),
      col: z.string().optional(),
      tray: z.string().optional(),
    })
    .optional(),
});

export function QueueItemBadges({
  props,
  className,
}: {
  props: QueueItemProps;
  className?: string;
}) {
  const common = commonKwargsSchema.safeParse(props.kwargs);
  if (!common.success) {
    return null;
  }
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {common.data.proposal && (
        <Badge variant="outline">proposal: {common.data.proposal}</Badge>
      )}
      {common.data.tray && <Badge variant="outline">{common.data.tray}</Badge>}
      {common.data.metadata?.tray && (
        <Badge variant="outline">{common.data.metadata.tray}</Badge>
      )}
      {common.data.col && common.data.row && (
        <Badge variant="outline">{`${common.data.col}${common.data.row}`}</Badge>
      )}
      {common.data.metadata?.col && common.data.metadata.row && (
        <Badge variant="outline">{`${common.data.metadata.col}${common.data.metadata.row}`}</Badge>
      )}
      {common.data.sampleType && common.data.sampleTag && (
        <Badge
          className={cn("border-none bg-slate-400 text-slate-800", {
            "bg-emerald-200 text-emerald-800":
              common.data.sampleType === "sample",
            "bg-sky-200 text-sky-800": common.data.sampleType === "buffer",
          })}
          variant="outline"
        >
          {common.data.sampleType}
          {common.data.sampleTag && <span>: {common.data.sampleTag}</span>}
        </Badge>
      )}
      {common.data.metadata?.sampleType && common.data.metadata.sampleTag && (
        <Badge
          className={cn("border-none bg-slate-400 text-slate-800", {
            "bg-emerald-200 text-emerald-800":
              common.data.metadata.sampleType === "sample",
            "bg-sky-200 text-sky-800":
              common.data.metadata.sampleType === "buffer",
          })}
          variant="outline"
        >
          {common.data.metadata.sampleType}
          {common.data.metadata.sampleTag && (
            <span>: {common.data.metadata.sampleTag}</span>
          )}
        </Badge>
      )}
    </div>
  );
}

export function QueueItemStatusBadge({
  props,
  isRunning,
}: {
  props: QueueItemProps;
  isRunning?: boolean;
}) {
  const status = () => {
    if (isRunning) {
      return "running";
    }
    if (props.itemUid.includes("optimistic")) {
      return "enqueing";
    }
    if (!props.result) {
      return "enqueued";
    }
    if (props.result.traceback) {
      return props.result.exitStatus ?? "failed";
    }
    return props.result.exitStatus ?? "finished";
  };
  return (
    <Badge
      className={cn("border-none bg-slate-200 text-slate-800", {
        "bg-red-200 text-red-800": status() === "failed",
        "bg-slate-200 text-slate-800": status() === "enqueued",
        "bg-blue-200 text-blue-800": status() === "running",
        "bg-green-200 text-green-800": status() === "completed",
        "bg-yellow-200 text-yellow-800":
          status() === "aborted" ||
          status() === "halted" ||
          status() === "stopped",
      })}
      variant="outline"
    >
      {status()}
    </Badge>
  );
}
