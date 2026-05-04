import { useState } from "react";
import { PlusIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { NewItemSearch } from "@sophys-web/widgets/new-item-search";
import { QueueStop } from "./queue-stop";
import { Setup4XpcsAquisitionDialog } from "./setup4-xps-acquisition";

export function OnDemandSelector() {
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
            Other Plans
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Setup 4</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Setup4XpcsAquisitionDialog
              className="font-normal"
              onClose={() => setMenuOpen(false)}
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Instructions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <QueueStop className="w-full justify-start font-normal" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full justify-start font-normal"
              onClick={() => setDialogOpen(true)}
            >
              <SearchIcon className="mr-2 h-4 w-4" /> Search by Plan Name
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
