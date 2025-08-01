import { PlusIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@sophys-web/ui/button";
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
// import { CleaningDialog } from "./cleaning";
import { QueueStop } from "./queue-stop";
import { SingleAcquisition } from "./single-acquisition";

export function OnDemandSelector() {
  const { loadedSample } = useCapillaryState();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <PlusIcon />
          Add
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>On demand</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <SingleAcquisition
            className="w-full justify-start font-normal"
            lastSampleParams={loadedSample}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <QueueStop className="w-full justify-start font-normal" />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <NewItemSearch
            onSuccessCallback={() => {
              toast.success("Item added to the queue");
            }}
            onErrorCallback={(error) => {
              toast.error(`Failed to add item to the queue: ${error}`);
            }}
            trigger={
              <Button
                variant="ghost"
                className="w-full justify-start font-normal group-has-data-[mutating=true]/actions:pointer-events-none group-has-data-[mutating=true]/actions:opacity-50"
              >
                <SearchIcon className="mr-2 h-4 w-4" /> Other
              </Button>
            }
          />
        </DropdownMenuItem>
        {/* <DropdownMenuItem asChild> 
              <CleaningDialog className="w-full justify-start font-normal" />
            </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
