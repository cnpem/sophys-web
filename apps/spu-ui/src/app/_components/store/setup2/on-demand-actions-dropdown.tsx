import { PlusIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { DetectSampleCardsButtonForm } from "./detect-sample-cards-button";
import { ErrorsCheckoutButtonForm } from "./errors-checkout-button";
import { RetrieveCardButtonForm } from "./retrieve-card-button";

export function OnDemandActions() {
  return (
    <DropdownMenu modal={false}>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
