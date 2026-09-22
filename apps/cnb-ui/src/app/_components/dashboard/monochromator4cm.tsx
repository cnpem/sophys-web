import { memo } from "react";
import {
  Atom,
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

const MemoAtomIcon = memo(Atom);

export function Monochromator4CMEnergy() {
  const pvData = usePvData("CNB:C:CK5M01:CS1:m7.RBV");

  function format(value: number | "NaN" | undefined): string {
    if (value === undefined || value === "NaN") {
      return "--";
    }
    return value.toFixed(1);
  }

  return (
    <Item className={cn({ "opacity-50": !pvData }, "justify-self-center")}>
      <ItemMedia>
        <MemoAtomIcon className="size-4 text-orange-500" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Energy</ItemTitle>
        <ItemDescription className="text-1xl font-semibold">
          {format(pvData?.value)} eV
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
