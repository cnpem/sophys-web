import { memo } from "react";
import { ThermometerIcon } from "lucide-react";
import { useSinglePvData } from "@sophys-web/pvws-store";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@sophys-web/ui/item";

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
    <Item>
      <ItemMedia>
        <MemoThermometerIcon className="size-8 text-red-500" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Sample Temperature</ItemTitle>
        <ItemDescription className="text-2xl font-semibold">
          {format(pvData?.value)} °C
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
