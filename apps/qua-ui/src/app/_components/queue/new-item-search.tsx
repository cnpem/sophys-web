import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@sophys-web/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@sophys-web/ui/dialog";
import { NewItemSearch } from "@sophys-web/widgets/new-item-search";

export function NewItemSearchDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full font-normal"
          size="sm"
        >
          <SearchIcon className="mr-2 h-4 w-4" /> New Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
          <DialogDescription>
            Select a plan to be added to the queue.
          </DialogDescription>
        </DialogHeader>
        <NewItemSearch
          onSuccessCallback={() => {
            toast.success("Item added to the queue");
            setOpen(false);
          }}
          onErrorCallback={(error) => {
            toast.error(`Failed to add item to the queue: ${error}`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
