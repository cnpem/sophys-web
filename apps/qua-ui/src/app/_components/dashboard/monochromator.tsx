import { memo, useEffect, useState } from "react";
import {
  AudioWaveformIcon,
  ChartNoAxesCombinedIcon,
  Layers2Icon,
} from "lucide-react";
import { usePvData } from "@sophys-web/pvws-store";
import { cn } from "@sophys-web/ui";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@sophys-web/ui/item";

const MemoLayers2Icon = memo(Layers2Icon);
const MemoAudioWaveformIcon = memo(AudioWaveformIcon);
const MemoChartNoAxesCombinedIcon = memo(ChartNoAxesCombinedIcon);

export function MonochromatorEnergy() {
  const pvData = usePvData("QUA:A:DCM01:GonRx_Energy_RBV");

  function format(value: number | "NaN" | undefined): string {
    if (value === undefined || value === "NaN") {
      return "--";
    }
    return `${(value * 1000).toFixed(2)}`;
  }

  return (
    <Item className={cn({ "opacity-50": !pvData }, "justify-self-center")}>
      <ItemMedia>
        <MemoLayers2Icon className="size-4 text-purple-500" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Beamline Energy</ItemTitle>
        <ItemDescription className="text-1xl font-semibold">
          {format(pvData?.value)} eV
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}

export function MonochromatorMode() {
  const pvDataStep = usePvData("QUA:A:DCM01:StepScan_Running_RBV");
  const pvDataFlyScan = usePvData("QUA:A:DCM01:Scan_Active_RBV");

  const [mode, setMode] = useState<"fly" | "step" | "idle" | "loading">(
    "loading",
  );

  useEffect(() => {
    const isStepRunning = pvDataStep?.value === 1;
    const isFlyRunning = pvDataFlyScan?.value === 1;

    if (!pvDataStep && !pvDataFlyScan) {
      setMode("loading");
    } else if (isFlyRunning) {
      setMode("fly");
    } else if (isStepRunning) {
      setMode("step");
    } else {
      setMode("idle");
    }
  }, [pvDataStep, pvDataFlyScan]);

  return (
    <Item
      className={cn(
        {
          "animate-pulse": mode !== "loading" && mode !== "idle",
          "opacity-50": mode === "loading",
        },
        "justify-self-center",
      )}
    >
      <ItemMedia>
        {mode === "fly" && (
          <MemoAudioWaveformIcon className="size-4 text-yellow-300" />
        )}
        {mode === "step" && (
          <MemoChartNoAxesCombinedIcon className="size-4 text-yellow-300" />
        )}
        {(mode === "idle" || mode === "loading") && (
          <MemoLayers2Icon className="size-4 text-gray-400" />
        )}
      </ItemMedia>

      <ItemContent>
        <ItemTitle>Scan Status</ItemTitle>

        <ItemDescription>
          {mode === "fly" && "Fly Scan"}
          {mode === "step" && "Step Scan"}
          {mode === "idle" && "Not running"}

          {mode === "loading" && "Checking scan status..."}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
