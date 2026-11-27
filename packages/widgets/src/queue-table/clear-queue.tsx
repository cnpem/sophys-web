import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
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

export function ClearQueue() {
  const { clear } = useQueue();
  const handleRemove = () => {
    clear.mutate(undefined, {
      onSuccess: () => toast.success("Queue cleared."),
      onError: () => toast.error("Failed to clear queue."),
    });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="text-destructive align-middle"
          disabled={clear.isPending}
        >
          {!clear.isPending && <Trash2Icon />}
          {clear.isPending && <Spinner />}
          Clear queue
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-fit">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure ?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will delete all the items currently in the queue
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRemove}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
