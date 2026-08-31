import { useState } from "react";
import { OctagonMinusIcon, PlusIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
import { Button } from "@sophys-web/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@sophys-web/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { NewItemSearch } from "@sophys-web/widgets/new-item-search";

function QueueStop({ className }: { className?: string }) {
  const { add } = useQueue();

  const handleSubmit = () => {
    add.mutate({
      item: {
        name: "queue_stop",
        itemType: "instruction",
        args: [],
        kwargs: {},
      },
    });
  };

  return (
    <Button variant="ghost" className={className} onClick={handleSubmit}>
      <OctagonMinusIcon className="mr-2 h-4 w-4" />
      Queue Stop
    </Button>
  );
}

export function OnDemandQueueItems() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="cursor-context-menu rounded-full"
          >
            <PlusIcon />
            Queue items
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild>
            <QueueStop className="w-full justify-start font-normal" />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full justify-start font-normal"
              onClick={() => setDialogOpen(true)}
            >
              <SearchIcon className="mr-2 h-4 w-4" /> Search
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Item</DialogTitle>
            <DialogDescription>
              "Select a plan to be added to the queue."
            </DialogDescription>
          </DialogHeader>
          <NewItemSearch
            onSuccessCallback={() => {
              toast.success("Item added to the queue");
              setDialogOpen(false);
              setMenuOpen(false);
            }}
            onErrorCallback={(error) => {
              toast.error(`Failed to add item to the queue: ${error}`);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
