import { useState } from "react";
import {
  AudioWaveformIcon,
  ChartNoAxesCombinedIcon,
  ChartSplineIcon,
  PlusIcon,
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
import { AddFlyScan } from "../plans/fly-scan";
import { AddRegionEnergyScan } from "../plans/region-energy-scan";
import { AddTimedRegionEnergyScan } from "../plans/time-region-energy-scan";

export function ScanSelector() {
  const { data: userData } = api.auth.getUser.useQuery();
  const [openDialogRegion, setOpenDialogRegion] = useState(false);
  const [openDialogTimed, setOpenDialogTimed] = useState(false);
  const [openDialogFly, setOpenDialogFly] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <PlusIcon />
            Energy Scans
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
              onClick={() => setOpenDialogRegion(true)}
            >
              <ChartSplineIcon className="mr-2 h-4 w-4" />
              Region Energy Scans
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full justify-start"
              disabled={!userData?.proposal}
              onClick={() => setOpenDialogTimed(true)}
            >
              <ChartNoAxesCombinedIcon className="mr-2 h-4 w-4" />
              Timed Energy Scans
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full justify-start"
              disabled={!userData?.proposal}
              onClick={() => setOpenDialogFly(true)}
            >
              <AudioWaveformIcon className="mr-2 h-4 w-4" />
              Fly-scan
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={openDialogRegion} onOpenChange={setOpenDialogRegion}>
        <DialogContent className="w-fit max-w-full flex-col">
          <DialogHeader>
            <DialogTitle>Region Energy Scan</DialogTitle>
            <DialogDescription className="flex flex-col gap-2">
              Please fill in the details below to submit the plan.
            </DialogDescription>
          </DialogHeader>
          <AddRegionEnergyScan
            className="w-2xl"
            onSubmitSuccess={() => {
              setMenuOpen(false);
              setOpenDialogRegion(false);
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={openDialogTimed} onOpenChange={setOpenDialogTimed}>
        <DialogContent className="w-fit max-w-full flex-col">
          <DialogHeader>
            <DialogTitle>Timed Energy Scan</DialogTitle>
            <DialogDescription className="flex flex-col gap-2">
              Please fill in the details below to submit the plan.
            </DialogDescription>
          </DialogHeader>
          <AddTimedRegionEnergyScan
            className="w-2xl"
            onSubmitSuccess={() => {
              setMenuOpen(false);
              setOpenDialogTimed(false);
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={openDialogFly} onOpenChange={setOpenDialogFly}>
        <DialogContent className="w-fit max-w-full flex-col">
          <DialogHeader>
            <DialogTitle>Fly Energy Scan</DialogTitle>
            <DialogDescription className="flex flex-col gap-2">
              Please fill in the details below to submit the plan.
            </DialogDescription>
          </DialogHeader>
          <AddFlyScan
            className="w-2xl"
            onSubmitSuccess={() => {
              setMenuOpen(false);
              setOpenDialogFly(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
