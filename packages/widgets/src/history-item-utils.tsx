import type { VariantProps } from "class-variance-authority";
import type { z } from "zod";
import { cva } from "class-variance-authority";
import { format, fromUnixTime } from "date-fns";
import { JsonEditor, monoLightTheme } from "json-edit-react";
import { InfoIcon } from "lucide-react";
import type { schemas } from "@sophys-web/api";
import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import { Button } from "@sophys-web/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sophys-web/ui/dialog";
import { ScrollArea, ScrollBar } from "@sophys-web/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";

type HistoryResponse = z.infer<typeof schemas.history.getResponseSchema>;
export type HistoryItemProps = HistoryResponse["items"][number];

const knownExitStatuses = [
  "failed",
  "finished",
  "completed",
  "aborted",
  "halted",
  "stopped",
  "other",
] as const;

/**
 * Generates a known status from the result object.
 * If the result has a traceback, it is considered failed.
 * Otherwise, it returns the exitStatus or "other" if exitStatus is not in knownExitStatuses.
 *
 *
 * @param result from HistoryItemProps
 * @returns A known status string
 */
export function itemStatusFromResult(
  result: HistoryItemProps["result"] | undefined,
) {
  if (!result) {
    return "other";
  }
  if (result.traceback) {
    return "failed";
  }
  if (
    knownExitStatuses.includes(
      result.exitStatus as (typeof knownExitStatuses)[number],
    )
  ) {
    return result.exitStatus as (typeof knownExitStatuses)[number];
  }
  return "other";
}

/**
 * Basic background and text color variants for different item statuses based on known exit statuses.
 * Used for styling status badges and components.
 */
export const statusBgVariants = cva("bg-slate-200 text-slate-800", {
  variants: {
    variant: {
      failed: "bg-red-200 text-red-800",
      completed: "bg-green-200 text-green-800",
      aborted: "bg-yellow-200 text-yellow-800",
      halted: "bg-yellow-200 text-yellow-800",
      stopped: "bg-yellow-200 text-yellow-800",
      finished: "bg-slate-200 text-slate-800",
      other: "bg-greyy-200 text-grey-800",
    },
  },
  defaultVariants: {
    variant: "finished",
  },
});

export function HistoryItemStatusBadge({
  className,
  variant,
}: {
  className?: string;
  variant: VariantProps<typeof statusBgVariants>["variant"];
}) {
  return (
    <Badge className={statusBgVariants({ variant, className })}>
      {variant}
    </Badge>
  );
}

export function HistoryItemDetails({
  item,
  className,
}: {
  item: HistoryItemProps;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3>Plan Name:</h3>
      <span className="text-sm">{item.name}</span>
      <h3>Finished At:</h3>
      <span className="text-sm">
        {new Date(item.result.timeStop).toLocaleString()}
      </span>
      <HistoryItemStatusBadge variant={itemStatusFromResult(item.result)} />
      <div>
        <h3>Parameters</h3>
        <JsonEditor
          restrictAdd={true}
          restrictDelete={true}
          restrictEdit={true}
          restrictDrag={true}
          data={item.kwargs}
          rootName={"parameters"}
          theme={monoLightTheme}
          className={cn("!bg-transparent !text-sm", className)}
        />
      </div>
    </div>
  );
}

/**
 * A dialog component to display detailed information about a history item.
 * It includes the item's name, status badge, finish time, and parameters in a JSON editor.
 * @param item The history item to display details for.
 * @param className Optional additional class names for styling.
 * @param customTrigger Optional custom trigger element to open the dialog. If not provided, a default info button is used.
 * @returns A React component rendering the dialog.
 */
export function HistoryItemDialog({
  item,
  className,
  customTrigger,
}: {
  item: HistoryItemProps;
  className?: string;
  customTrigger?: React.ReactNode;
}) {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            {customTrigger ?? (
              <Button variant="ghost" size="icon" className="border-none">
                <InfoIcon />
              </Button>
            )}
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>View Details</TooltipContent>
      </Tooltip>
      <DialogContent className={cn("w-fit max-w-full", className)}>
        <DialogHeader>
          <DialogTitle>History Item</DialogTitle>
          <DialogDescription>
            Detailed information about the selected history item.
          </DialogDescription>
        </DialogHeader>
        <ul className="mb-4 flex flex-col items-start gap-2">
          <HistoryItemStatusBadge
            variant={itemStatusFromResult(item.result)}
            className="w-full"
          />
          <li>
            <span className="text-accent">Name:</span> {item.name}
          </li>
          <li>
            <span className="text-accent">Start Time:</span>
            <span className="ml-1 text-sm">
              {format(
                fromUnixTime(item.result.timeStart),
                "yyyy/MM/dd HH:mm:ss",
              )}
            </span>
          </li>
          <li>
            <span className="text-accent">End Time:</span>
            <span className="ml-1 text-sm">
              {format(
                fromUnixTime(item.result.timeStop),
                "yyyy/MM/dd HH:mm:ss",
              )}
            </span>
          </li>
          <li>
            <span className="text-accent">User:</span> {item.user}
          </li>
          <li>
            <span className="text-accent">Parameters:</span>
            <JsonEditor
              restrictAdd={true}
              restrictDelete={true}
              restrictEdit={true}
              restrictDrag={true}
              data={item.kwargs}
              rootName={"kwargs"}
              theme={monoLightTheme}
              className={cn("!text-md !ml-0", className)}
            />
          </li>
          <li>
            <span className="text-accent">
              Message:
              <TracebackDialog item={item} />
            </span>
            {item.result.msg && (
              <p className="whitespace-pre-wrap">{item.result.msg}</p>
            )}
          </li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function TracebackDialog({ item }: { item: HistoryItemProps }) {
  const traceback = item.result.traceback;

  function onDownload() {
    if (!traceback) return;
    const blob = new Blob([traceback], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "traceback.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="m-0 border-none"
              disabled={!traceback}
            >
              <InfoIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>View Traceback</TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-96 w-fit max-w-full">
        <DialogHeader>
          <DialogTitle>Traceback</DialogTitle>
          <DialogDescription>
            Traceback for <span className="font-medium">{item.name}</span> -
            Started at:{" "}
            <span className="font-medium">
              {format(
                fromUnixTime(item.result.timeStart),
                "yyyy/MM/dd HH:mm:ss",
              )}
            </span>
          </DialogDescription>
        </DialogHeader>
        {!traceback && <div>No traceback available.</div>}
        {traceback && (
          <ScrollArea
            className="bg-accent h-96 w-fit rounded-md border p-4"
            id="my-scroll"
          >
            <pre className="field-sizing-content font-mono text-base whitespace-pre-wrap">
              {traceback + traceback + traceback + traceback + traceback}
            </pre>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            disabled={!traceback}
            onClick={onDownload}
          >
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
