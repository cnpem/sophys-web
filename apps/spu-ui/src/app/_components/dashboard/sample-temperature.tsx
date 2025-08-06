import { memo } from "react";
import { ThermometerIcon } from "lucide-react";
import { useSinglePvData } from "@sophys-web/pvws-store";

const MemoThermometerIcon = memo(ThermometerIcon);

export function SampleTemperatureMonitor() {
  const pvName = "SPU:B:XENOCS:SAMPLE_TEMP_RBV";
  const pvData = useSinglePvData(pvName);

  function format(value: number | "NaN" | undefined): string {
    if (value === undefined || value === "NaN") {
      return "--";
    }
    return `${value.toFixed(2)}`;
  }

  return (
    <div className="flex items-center rounded-md border p-3">
      <MemoThermometerIcon className="mr-3 h-8 w-8 text-red-500" />
      <div>
        <div className="text-muted-foreground text-sm">Sample Temperature</div>
        <span className="text-2xl font-semibold">
          {format(pvData?.value)} °C
        </span>
      </div>
    </div>
  );
}
