import { JsonEditor, monoLightTheme } from "json-edit-react";
import { Trash2Icon } from "lucide-react";
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
import type { QueueItemProps } from "./types";

export function DeleteItem({
  item,
  handleRemove,
  isRemoving,
}: {
  item: QueueItemProps;
  handleRemove: () => void;
  isRemoving: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive size-4 align-middle"
          disabled={isRemoving}
        >
          {!isRemoving && <Trash2Icon />}
          {isRemoving && <Spinner />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-fit">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
          <AlertDialogDescription>Deleting {item.name}</AlertDialogDescription>
        </AlertDialogHeader>
        <p>Parameters</p>
        <JsonEditor
          restrictAdd={true}
          restrictDelete={true}
          restrictEdit={true}
          restrictDrag={true}
          data={item.kwargs}
          rootName={"$"}
          theme={monoLightTheme}
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRemove}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
