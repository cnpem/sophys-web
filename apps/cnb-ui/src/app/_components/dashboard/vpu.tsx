import { memo } from "react";
import { Atom, Waves, WavesIcon} from "lucide-react";
import { usePvData } from "@sophys-web/pvws-store";
import { cn } from "@sophys-web/ui";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@sophys-web/ui/item";

const MemoWavesIcon = memo(WavesIcon);
export function VPU() {
  const pvData = usePvData("SI-06SB:ID-VPU29:KParam-Mon");

  function format(value: number | "NaN" | undefined): string {
    if (value === undefined || value === "NaN") {
      return "--";
    }
    return value.toFixed(3);
  }

  return (
    <Item className={cn({ "opacity-50": !pvData }, "justify-self-center")}>
      <ItemMedia>
        <MemoWavesIcon className="size-4 text-purple-500" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>VPU Gap</ItemTitle>
        <ItemDescription className="text-1xl font-semibold">
          {format(pvData?.value)} mm
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
