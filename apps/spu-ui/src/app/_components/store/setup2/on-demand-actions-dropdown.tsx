import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { Setup2AquisitionDialog } from "../../plans/setup2-acquisition";
import { Setup2PickCardByIndexDialog } from "../../plans/setup2-pick-card-by-index-form";
import { DetectSampleCardsButtonForm } from "./detect-sample-cards-button";
import { ErrorsCheckoutButtonForm } from "./errors-checkout-button";
import { RetrieveCardButtonForm } from "./retrieve-card-button";

export function OnDemandActions() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <DropdownMenu modal={false} open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon />
          Add Plans
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40" align="start">
        <DropdownMenuItem asChild>
          <ErrorsCheckoutButtonForm
            className="w-full justify-start"
            variant="ghost"
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <DetectSampleCardsButtonForm
            className="w-full justify-start"
            variant="ghost"
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <RetrieveCardButtonForm
            className="w-full justify-start"
            variant="ghost"
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
          <Setup2PickCardByIndexDialog
            className="w-full justify-start"
            variant="ghost"
            onClose={() => setMenuOpen(false)}
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
          <Setup2AquisitionDialog
            className="w-full justify-start"
            variant="ghost"
            onClose={() => setMenuOpen(false)}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
