import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { useCapillaryState } from "~/app/_hooks/use-capillary-state";
import { QueueStop } from "../../plans/queue-stop";
import { CustomCleaningDialog } from "../../plans/setup1-custom-cleaning";
import { SingleAcquisition } from "../../plans/setup1-single-acquisition";
import { StandardCleaningDialog } from "../../plans/setup1-standard-cleaning";

export function OnDemandActions() {
  const { loadedSample } = useCapillaryState();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon />
          Add Plans
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem asChild>
          <SingleAcquisition
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
          <CustomCleaningDialog
            className="w-full justify-start font-normal"
            onClose={() => setMenuOpen(false)}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <QueueStop className="w-full justify-start font-normal" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
