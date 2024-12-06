import { UploadIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sophys-web/ui/dialog";

export function UploadQueue() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button title="load new experiment queue" size="icon" variant="outline">
          <UploadIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Load Experiment Queue</DialogTitle>
          <DialogDescription>
            Load a new experiment queue from a CSV file.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
