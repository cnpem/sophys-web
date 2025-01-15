import { useCallback } from "react";
import { GripVerticalIcon, XIcon } from "lucide-react";
import { z } from "zod";
import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import { Button } from "@sophys-web/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import type { QueueItemProps } from "../../../lib/types";
import { useQueue } from "../../_hooks/use-queue";
import { schema as completeAcquisitionSchema } from "../../../lib/schemas/plans/complete-acquisition";
import { ItemEditDialog } from "./item-edit-dialog";

function formatPlanNames(name: string) {
  return name.replace(/_/g, " ");
}

const commonKwargsSchema = z.object({
  proposal: z.string().optional(),
  tray: z.string().optional(),
  col: z.string().optional(),
  row: z.string().optional(),
  sampleType: z.string().optional(),
  sampleTag: z.string().optional(),
  metadata: z
    .object({
      sampleType: z.string(),
      sampleTag: z.string(),
      bufferTag: z.string(),
    })
    .optional(),
});

function UnknownItem({
  props,
  status,
}: {
  props: QueueItemProps;
  status: string;
}) {
  const common = commonKwargsSchema.safeParse(props.kwargs);
  return (
    <Card
      className={cn("relative rounded-sm border", {
        "animate-pulse border-none bg-slate-100": !props.itemUid,
      })}
    >
      <CardHeader>
        <CardDescription className="flex items-center gap-4">
          <Badge
            className={cn("mr-2 border-none bg-slate-200 text-slate-800", {
              "bg-red-200 text-red-800": status === "failed",
              "bg-slate-200 text-slate-800": status === "enqueued",
              "bg-blue-200 text-blue-800": status === "running",
              "bg-yellow-200 text-yellow-800":
                status === "aborted" ||
                status === "halted" ||
                status === "stopped",
            })}
            variant="outline"
          >
            {status}
          </Badge>
          <span className="break-all">@{props.user}</span>
        </CardDescription>
        <CardTitle>
          <span className="break-all">{formatPlanNames(props.name)}</span>
        </CardTitle>
        <div className="absolute right-2 top-2 flex gap-1">
          <Button className="size-8" size="icon" variant="outline" disabled>
            <GripVerticalIcon className="h-4 w-4" />
          </Button>
          <ItemEditDialog {...props} />
          <RemoveButton uid={props.itemUid} />
        </div>
      </CardHeader>
      <CardContent>
        {common.success && (
          <div className="flex flex-wrap items-center gap-2">
            {common.data.proposal && (
              <Badge variant="outline">proposal: {common.data.proposal}</Badge>
            )}
            {common.data.tray && (
              <Badge variant="outline">{common.data.tray}</Badge>
            )}
            {common.data.col && common.data.row && (
              <Badge variant="outline">{`${common.data.col}${common.data.row}`}</Badge>
            )}
            {common.data.sampleType && common.data.sampleTag && (
              <Badge
                className={cn("border-none bg-slate-400 text-slate-800", {
                  "bg-emerald-200 text-emerald-800":
                    common.data.sampleType === "sample",
                  "bg-sky-200 text-sky-800":
                    common.data.sampleType === "buffer",
                })}
                variant="outline"
              >
                {common.data.sampleType}
                {common.data.sampleTag && (
                  <span>: {common.data.sampleTag}</span>
                )}
              </Badge>
            )}
            {common.data.metadata && (
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
        )}
      </CardContent>
    </Card>
  );
}

export function SkeletonItem() {
  return (
    <li>
      <Card className="relative animate-pulse border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <span className="h-6 w-24 rounded bg-muted" />
            <Badge className="border-none bg-muted" variant="outline" />
          </CardTitle>
          <CardDescription className="space-y-2">
            <div className="flex gap-2">
              <span className="h-5 w-44 rounded bg-muted" />
              <span className="h-5 w-28 rounded bg-muted" />
            </div>
            <div className="flex gap-2">
              <Badge className="border-none bg-muted" variant="outline" />
              <Badge className="border-none bg-muted" variant="outline" />
              <Badge className="border-none bg-muted" variant="outline" />
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    </li>
  );
}

export function RunningItem({ props }: { props: QueueItemProps }) {
  const { data: planParams } = completeAcquisitionSchema.safeParse(
    props.kwargs,
  );
  if (!planParams) {
    return <UnknownItem props={props} status="running" />;
  }
  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <span className="break-all">{props.name}</span>
          <Badge
            className="border-none bg-sky-200 text-sky-800"
            variant="outline"
          >
            running
          </Badge>
        </CardTitle>
        <CardDescription>
          @{props.user} - {planParams.proposal}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{planParams.tray}</Badge>
          <Badge variant="outline">{`${planParams.col}${planParams.row}`}</Badge>
          <Badge
            className={cn("border-none bg-slate-400 text-slate-800", {
              "bg-emerald-200 text-emerald-800":
                planParams.sampleType === "sample",
              "bg-sky-200 text-sky-800": planParams.sampleType === "buffer",
            })}
            variant="outline"
          >
            {planParams.sampleType}
          </Badge>
          <Badge variant="default">{planParams.sampleTag}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function QueueItem({
  isRunning,
  props,
}: {
  isRunning?: boolean;
  props: QueueItemProps;
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

  return <UnknownItem props={props} status={status()} />;
}

function RemoveButton({ uid }: { uid?: string }) {
  const { remove } = useQueue();
  const handleRemove = useCallback(() => {
    if (uid !== undefined) {
      remove.mutate({ uid });
    }
  }, [remove, uid]);
  return (
    <Button
      className="size-8"
      onClick={handleRemove}
      size="icon"
      variant="outline"
    >
      <XIcon className="h-4 w-4" />
    </Button>
  );
}
