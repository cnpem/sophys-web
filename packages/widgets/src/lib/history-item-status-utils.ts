// import type { VariantProps } from "class-variance-authority";
import type { z } from "zod";
import { cva } from "class-variance-authority";
import type { schemas } from "@sophys-web/api";

// import { cn } from "@sophys-web/ui";

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
export function itemStatusFromResult(result: HistoryItemProps["result"]) {
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
    status: {
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
    status: "finished",
  },
});
