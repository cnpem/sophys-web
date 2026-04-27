import { useCallback } from "react";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@sophys-web/ui/alert-dialog";
import { Button } from "@sophys-web/ui/button";
import { Spinner } from "@sophys-web/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";
import { useSampleStore } from "./use-sample-store";

export function DeleteSamplesDialog() {
  const { storeData, clearStore, error, parseError, isLoading, isPending } =
    useSampleStore();

  const clearAllSamples = useCallback(async () => {
    toast.info("Clearing samples");
    await clearStore();
  }, [clearStore]);

  const isEmpty = storeData === undefined;
  const waitingForResponse = isLoading || isPending;
  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive size-4 align-middle"
              disabled={
                isPending || isLoading || isEmpty || !!error || !!parseError
              }
            >
              {!waitingForResponse && <Trash2Icon />}
              {waitingForResponse && <Spinner />}
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Delete samples information</TooltipContent>
      </Tooltip>
      <AlertDialogContent className="w-fit">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
          <AlertDialogDescription>
            Deleting Setup 2 Tray data
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={clearAllSamples}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
