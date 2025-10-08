import { useEffect, useRef, useState } from "react";
import { JsonEditor, monoLightTheme } from "json-edit-react";
import { AlertCircleIcon } from "lucide-react";
import { useSound } from "use-sound";
import { useQueue } from "@sophys-web/api-client/hooks";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sophys-web/ui/card";
import { HistoryItemContent } from "@sophys-web/widgets/history-item-utils";

export function RunningItem() {
  const { queue } = useQueue();
  const runningItemUidRef = useRef<string | null>(null);
  const [finishedItemUid, setFinishedItemUid] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const status = api.status.get.useQuery(undefined, {
    refetchInterval: 1 * 1000, // 1 second
    refetchOnWindowFocus: "always",
    refetchOnMount: "always",
  });
  const { data: historyLastItem, isPending } = api.history.get.useQuery(
    // filter data.items for the item with itemUid matching runningItemUidRef.current
    undefined,
    {
      enabled: !!finishedItemUid,
      select: (data) =>
        data.items.find((item) => item.itemUid === finishedItemUid),
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
    const prevRunningItemUid = runningItemUidRef.current;
    const currentRunningItemUid = status.data?.runningItemUid;
    const prevExists = prevRunningItemUid && prevRunningItemUid !== "";
    const nowEmpty = !currentRunningItemUid;

    if (prevExists && nowEmpty) {
      setDialogOpen(true);
      setFinishedItemUid(prevRunningItemUid);
    }
    runningItemUidRef.current = currentRunningItemUid ?? null;
  }, [status.data?.runningItemUid]);

  const runningItemData = queue.data?.runningItem;

  // component state when a plan is currently running, showing the running item details
  const isRunning = !!runningItemData && !!status.data?.runningItemUid;
  // component state when a plan has just finished, triggering the dialog with last item details
  const JustFinished = !runningItemData && !!finishedItemUid;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Running Item</CardTitle>
        <CardDescription>Currently running task</CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          {isRunning && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {runningItemData.name.replace(/_/g, " ")}
                </h3>
                <p className="text-muted-foreground">{runningItemData.user}</p>
              </div>
              {runningItemData.kwargs && (
                <div>
                  <h3>Parameters</h3>
                  <JsonEditor
                    restrictAdd={true}
                    restrictDelete={true}
                    restrictEdit={true}
                    restrictDrag={true}
                    data={runningItemData.kwargs}
                    rootName={"kwargs"}
                    theme={monoLightTheme}
                    className="!text-sm"
                  />
                </div>
              )}
            </div>
          )}
          {!!JustFinished && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircleIcon className="text-muted-foreground mb-2 size-10" />
              <p className="text-muted-foreground">No task currently running</p>
            </div>
          )}
          {!isRunning && !JustFinished && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircleIcon className="text-muted-foreground mb-2 size-8" />
              <p className="text-muted-foreground">No task currently running</p>
            </div>
          )}
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Plan Finished</AlertDialogTitle>
              <AlertDialogDescription>
                The last running plan has finished. You can review the results
                below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {isPending && <div>Loading last item...</div>}
            {!isPending && !historyLastItem && (
              <div className="mt-4">
                <span>Last item not found.</span>
                <span>Searching for itemUid: {finishedItemUid}</span>
              </div>
            )}
            {!isPending && historyLastItem && (
              <HistoryItemContent item={historyLastItem} />
            )}
            <AlertDialogFooter className="mt-0">
              <AlertDialogAction>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
