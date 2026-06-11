import { useState } from "react";
import {
  FlameIcon,
  FlaskConicalIcon,
  SnowflakeIcon,
  WindIcon,
  ZapIcon,
} from "lucide-react";
import { api } from "@sophys-web/api-client/react";
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
import { AddHeat } from "../plans/heat-sample";

export function InSituSelector() {
  const { data: userData } = api.auth.getUser.useQuery();
  const [openDialogHeat, setopenDialogHeat] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="rounded-full" size="sm">
            <FlaskConicalIcon />
            Sample environment
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-auto">
          <DropdownMenuLabel>On demand</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full justify-start"
              disabled={!userData?.proposal}
              onClick={() => setopenDialogHeat(true)}
            >
              <FlameIcon className="mr-2 h-4 w-4" />
              Heat Sample
            </Button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Button variant="ghost" className="w-full justify-start" disabled>
              <SnowflakeIcon className="mr-2 h-4 w-4" />
              Cool Sample
            </Button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Button variant="ghost" className="w-full justify-start" disabled>
              <WindIcon className="mr-2 h-4 w-4" />
              Gas
            </Button>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Button variant="ghost" className="w-full justify-start" disabled>
              <ZapIcon className="mr-2 h-4 w-4" />
              Potentiostat
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={openDialogHeat} onOpenChange={setopenDialogHeat}>
        <DialogContent className="w-fit max-w-full flex-col">
          <DialogHeader>
            <DialogTitle>Heat sample</DialogTitle>
            <DialogDescription className="flex flex-col gap-2">
              Please fill in the details below to submit the plan.
            </DialogDescription>
          </DialogHeader>
          <AddHeat
            className="w-2xl"
            onSubmitSuccess={() => {
              setMenuOpen(false);
              setopenDialogHeat(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
