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
import { ScrollArea } from "@sophys-web/ui/scroll-area";
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
      other: "bg-grey-200 text-grey-800",
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
      <DialogContent className={cn("max-w-3xl", className)}>
        <DialogHeader>
          <DialogTitle>History Item</DialogTitle>
          <DialogDescription>
            Detailed information about the selected history item.
          </DialogDescription>
        </DialogHeader>
        <HistoryItemContent item={item} />
      </DialogContent>
    </Dialog>
  );
}

export function HistoryItemContent({
  item,
  className,
}: {
  item: HistoryItemProps;
  className?: string;
}) {
  return (
    <ScrollArea className="max-h-96">
      <ul
        className={cn(
          "mb-4 flex flex-col items-start gap-2 text-sm",
          className,
        )}
      >
        <HistoryItemStatusBadge
          variant={itemStatusFromResult(item.result)}
          className="w-full"
        />
        <li>
          <span className="text-muted-foreground font-semibold">Name:</span>{" "}
          {item.name}
        </li>
        <li>
          <span className="text-muted-foreground font-semibold">
            Start Time:
          </span>
          <span className="ml-1 text-sm">
            {format(fromUnixTime(item.result.timeStart), "yyyy/MM/dd HH:mm:ss")}
          </span>
        </li>
        <li>
          <span className="text-muted-foreground font-semibold">End Time:</span>
          <span className="ml-1 text-sm">
            {format(fromUnixTime(item.result.timeStop), "yyyy/MM/dd HH:mm:ss")}
          </span>
        </li>
        <li>
          <span className="text-muted-foreground font-semibold">User:</span>{" "}
          {item.user}
        </li>
        <li>
          <span className="text-muted-foreground font-semibold">
            Parameters:
          </span>
          <JsonEditor
            restrictAdd={true}
            restrictDelete={true}
            restrictEdit={true}
            restrictDrag={true}
            data={item.kwargs}
            rootName={"kwargs"}
            theme={monoLightTheme}
            className={cn("!ml-0 !text-sm", className)}
          />
        </li>
        <li>
          <span className="text-muted-foreground font-semibold">
            Message:
            <TracebackDialog item={item} />
          </span>
          {item.result.msg && (
            <p className="max-w-full whitespace-pre-wrap">{item.result.msg}</p>
          )}
        </li>
      </ul>
    </ScrollArea>
  );
}

export function TracebackDialog({ item }: { item: HistoryItemProps }) {
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
      <DialogContent className="flex h-svh max-h-svh w-5xl max-w-full flex-col">
        <DialogHeader>
          <DialogTitle>Traceback</DialogTitle>
          <DialogDescription>
            Traceback for{" "}
            <span className="text-sm font-semibold">{item.name}</span> - started
            at:{" "}
            <span className="font-semibold">
              {format(
                fromUnixTime(item.result.timeStart),
                "yyyy/MM/dd HH:mm:ss",
              )}
            </span>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="bg-accent max-h-full min-h-0 flex-1 rounded-md border p-4">
          <pre className="h-full max-h-full w-full overflow-auto font-mono text-sm whitespace-pre-wrap">
            {traceback ?? "No traceback available."}
          </pre>
        </ScrollArea>
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
