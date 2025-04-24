import { PlusIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { useCapillaryState } from "~/app/_hooks/use-capillary-state";
import { CleaningDialog } from "./cleaning";
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
          <CleaningDialog className="w-full justify-start font-normal" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
