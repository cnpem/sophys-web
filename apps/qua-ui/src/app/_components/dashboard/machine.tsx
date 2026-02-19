import { memo, useEffect, useState } from "react";
import { RefreshCcwIcon } from "lucide-react";
import { usePvData } from "@sophys-web/pvws-store";
import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@sophys-web/ui/item";

const MemoRefreshCcwIcon = memo(RefreshCcwIcon);

export function MachineInfo() {
  const currentThreshold = 198 as const;

  const pvDataCurrent = usePvData("SI-Glob:AP-CurrInfo:Current-Mon");
  const pvDataStable = usePvData("SI-Glob:AP-StabilityInfo:BbBLStatus-Mon");

  const [beamStatus, setBeamStatus] = useState<
    "Stable" | "Unstable" | "Low Current" | "Loading"
  >("Loading");

  useEffect(() => {
    const current = Number(pvDataCurrent?.value);
    const isStable = pvDataStable?.value === 0;

    if (!pvDataCurrent) {
      setBeamStatus("Loading");
    } else if (current < currentThreshold) {
      setBeamStatus("Low Current");
    } else if (!isStable) {
      setBeamStatus("Unstable");
    } else {
      setBeamStatus("Stable");
    }
  }, [pvDataCurrent, pvDataStable]);

  return (
    <Item
      className={cn(
        { "opacity-50": !pvDataCurrent || !pvDataStable },
        "justify-self-center",
      )}
    >
      <ItemMedia>
        <MemoRefreshCcwIcon className="text-1xl size-4 font-semibold" />
      </ItemMedia>

      <ItemContent>
        <ItemTitle>Beam Status</ItemTitle>

        <ItemDescription>
          <Badge
            className={cn("border-none", {
              "bg-green-200 text-green-800": beamStatus === "Stable",
              "bg-orange-200 text-orange-800": beamStatus === "Unstable",
              "bg-red-200 text-red-800": beamStatus === "Low Current",
              "bg-slate-200 text-slate-800": beamStatus === "Loading",
            })}
            variant="outline"
          >
            {beamStatus}
          </Badge>
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
