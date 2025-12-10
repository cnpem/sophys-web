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
import { useCapillaryState } from "~/app/_hooks/use-capillary-state";
import { CompleteAcquisition } from "./complete-acquisition";
// import { CleaningDialog } from "./cleaning";
import { QueueStop } from "./queue-stop";
import { SingleAcquisition } from "./single-acquisition";
import { StandardCleaningDialog } from "./standard-cleaning";

export function OnDemandSelector() {
  const { loadedSample } = useCapillaryState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <PlusIcon />
            Add
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>On demand</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <SingleAcquisition
              className="w-full justify-start font-normal"
              lastSampleParams={loadedSample}
              onClose={() => setMenuOpen(false)}
            />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <CompleteAcquisition
              className="w-full justify-start font-normal"
              lastSampleParams={loadedSample}
              onClose={() => setMenuOpen(false)}
            />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <StandardCleaningDialog
              className="w-full justify-start font-normal"
              onClose={() => setMenuOpen(false)}
            />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <QueueStop className="w-full justify-start font-normal" />
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full justify-start font-normal"
              onClick={() => setDialogOpen(true)}
            >
              <SearchIcon className="mr-2 h-4 w-4" /> Other
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
