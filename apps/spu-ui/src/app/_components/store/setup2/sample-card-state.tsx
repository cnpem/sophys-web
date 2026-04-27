import { memo } from "react";
import { InfoIcon, SquareMousePointerIcon } from "lucide-react";
import { usePvData } from "@sophys-web/pvws-store";
import { cn } from "@sophys-web/ui";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@sophys-web/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@sophys-web/ui/tooltip";

const MemoIcon = memo(SquareMousePointerIcon);

const sampleCardStateMessageMap = {
  "-1": "Routine error",
  "-2": "Hutch Interlock error",
  "-3": "Hutch Opened + error",
  "-10": "Taxi sensor error",
  "-11": "Jaw occupied error",
  "-12": "Unable to return home error",
  "-13": "Robot EPS permission error",
  "-14": "Aborted by user",
  "0": "Not Initialized",
  "1": "No card/Idle",
  "2": "Loaded",
} as const;

type SampleCardStatus =
  | "undefined"
  | "error"
  | "not initialized"
  | "no card/idle"
  | "loaded";

const pvName = "SPU:B:YASKAWA01:MasterSM_RBV";

/**
 * Hook to get the interpreted status of the sample card based on the Yaskawa PV data.
 * @returns An object containing the interpreted status, the raw PV value, and an optional message for error states.
 * The status can be one of "undefined", "error", "not initialized", "no card/idle", or "loaded".
 * The message provides additional information for error states based on the PV value.
 */
export const useSampleCardStatus = () => {
  const pvData = usePvData(pvName);

  function format(value: number | "NaN" | undefined): SampleCardStatus {
    if (value === undefined || value === "NaN") {
      return "undefined";
    }
    if (value < 0) {
      // error states
      return "error";
    }
    if (value === 0) {
      return "not initialized";
    }
    if (value === 1) {
      return "no card/idle";
    }
    if (value === 2) {
      return "loaded";
    }
    return "undefined"; // default case, should not happen if all cases are handled
  }

  const status = format(pvData?.value);
  const message = pvData
    ? sampleCardStateMessageMap[
        pvData.value as keyof typeof sampleCardStateMessageMap
      ]
    : undefined;

  return {
    status,
    rawValue: pvData?.value,
    message,
  };
};

export function SampleCardState() {
  const { status, message } = useSampleCardStatus();
  return (
    <Item variant={"muted"} size="sm">
      <ItemMedia>
        <MemoIcon className="size-4 text-sm" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Sample Card State</ItemTitle>
        <ItemDescription
          className={cn(
            "text-offline space-x-2 text-sm font-semibold",
            status === "error" && "text-error",
            status === "no card/idle" && "text-online",
            status === "loaded" && "text-busy",
          )}
        >
          <span className="capitalize">{status.toUpperCase()}</span>
          {message && (
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="text-muted-foreground hover:text-foreground size-3" />
              </TooltipTrigger>
              <TooltipContent>{message}</TooltipContent>
            </Tooltip>
          )}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
