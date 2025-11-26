import { useState } from "react";
import { AudioWaveformIcon, PlusIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import { AddRegionEnergyScan } from "../plans/region-energy-scan";
import { AddTimedRegionEnergyScan } from "../plans/time-region-energy-scan";

export function ScanSelector() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
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
          <AddRegionEnergyScan />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <AddTimedRegionEnergyScan />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button variant="ghost" disabled>
            <AudioWaveformIcon />
            Fly-scan
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
