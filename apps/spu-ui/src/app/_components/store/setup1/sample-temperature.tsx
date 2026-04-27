import { memo } from "react";
import { ThermometerIcon } from "lucide-react";
import { usePvData } from "@sophys-web/pvws-store";
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
  const pvData = usePvData(pvName);

  function format(value: number | "NaN" | undefined): string {
    if (value === undefined || value === "NaN") {
      return "--";
    }
    return `${value.toFixed(2)}`;
  }

  return (
    <Item variant={"muted"} size="sm">
      <ItemMedia>
        <MemoThermometerIcon className="size-4 text-sm text-red-500" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Sample Temperature</ItemTitle>
        <ItemDescription className="text-sm font-semibold">
          {format(pvData?.value)} °C
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
