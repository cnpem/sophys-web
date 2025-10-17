"use client";

import { useEffect, useRef, useState } from "react";
import { fromUnixTime } from "date-fns";
import { AlertCircleIcon } from "lucide-react";
import { useSound } from "use-sound";
import { useStatus } from "@sophys-web/api-client/hooks";
import { api } from "@sophys-web/api-client/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@sophys-web/ui/alert-dialog";
import { HistoryItemContent } from "@sophys-web/widgets/history-item-utils";

export function FinishedItemAlertDialog() {
  const aknowledgeItemUidRef = useRef<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { status } = useStatus();
  const {
    data: historyLastItem,
    isFetching,
    isLoading,
    isError,
    error,
  } = api.history.get.useQuery(
    // get only the first element of the history (most recent)
    undefined,
    {
      select: (data) => data.items[0],
    },
  );

  const [playSound] = useSound("/sounds/hopeful-notification.mp3");

  useEffect(() => {
    if (!dialogOpen) return;
    // play sound immediately when dialog opens
    playSound();
    // then set interval to play sound every 5 seconds
    const interval = setInterval(() => {
      playSound();
    }, 5000); // every 5 seconds
    return () => clearInterval(interval);
  }, [dialogOpen, playSound]);

  useEffect(() => {
    // history is empty
    if (!historyLastItem || isFetching) return;
    // already aknowledge item notification
    if (aknowledgeItemUidRef.current === historyLastItem.itemUid) return;
    // no status data
    if (!status.data) return;
    const workerIsRunning =
      status.data.workerEnvironmentState === "executing_plan" ||
      status.data.workerEnvironmentState === "executing_task";
    // do not notify while the worker is still running
    if (workerIsRunning) return;
    const now = new Date();
    const finishedAt = fromUnixTime(historyLastItem.result.timeStop);
    const timeDifference = now.getTime() - finishedAt.getTime();
    const oneMinuteInMs = 60 * 1000;
    // If finished in the last minute, opens the dialog
    if (timeDifference <= oneMinuteInMs && timeDifference >= 0) {
      setDialogOpen(true);
      aknowledgeItemUidRef.current = historyLastItem.itemUid;
    }
  }, [historyLastItem, isFetching, status]);

  const showLoading = isLoading || isFetching;

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Plan Finished</AlertDialogTitle>
          <AlertDialogDescription>
            The last running plan has finished. You can review the results
            below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {showLoading && <div>Loading last item...</div>}
        {!showLoading && historyLastItem && (
          <HistoryItemContent item={historyLastItem} />
        )}
        {isError && (
          <div className="text-destructive flex flex-col items-center justify-center py-4 text-center">
            <AlertCircleIcon className="mb-2 size-8" />
            <p className="font-semibold">Error: {error.message}</p>
          </div>
        )}
        <AlertDialogFooter className="mt-0">
          <AlertDialogAction>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
