import { memo } from "react";
import { ThermometerIcon } from "lucide-react";
import { usePvData } from "@sophys-web/pvws-store";
import { cn } from "@sophys-web/ui";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@sophys-web/ui/item";

const MemoThermometerIcon = memo(ThermometerIcon);

export function SampleInfo() {
  const pvDataTemp = usePvData("QUA:B:RIO01:9219C:TC0");
  const pvDataTemp2 = usePvData("QUA:B:RIO01:9219C:TC1");

  function format(value: number | "NaN" | undefined): string {
    if (value === undefined || value === "NaN") {
      return "--";
    }
    return `${value.toFixed(2)}`;
  }

  return (
    <Item
      className={cn(
        { "opacity-50": !pvDataTemp || !pvDataTemp2 },
        "justify-self-center",
      )}
    >
      <ItemMedia>
        <MemoThermometerIcon className="text-1xl size-4 font-semibold text-red-500" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Sample Temperature</ItemTitle>
        <ItemDescription className="text-1xl font-semibold">
          {format(pvDataTemp?.value)} °C | {format(pvDataTemp2?.value)} °C
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
