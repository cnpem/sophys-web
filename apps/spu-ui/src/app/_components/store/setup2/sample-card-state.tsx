import { memo, useEffect, useState } from "react";
import { SquareMousePointerIcon } from "lucide-react";
import { z } from "zod";
import { usePvData } from "@sophys-web/pvws-store";
import { cn } from "@sophys-web/ui";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@sophys-web/ui/item";
import { cardIndexOptions } from "./constants";

const MemoIcon = memo(SquareMousePointerIcon);

const cardPvName = "SPU:B:YASKAWA01:CardAtExperiment_RBV";

const cardAtExperimentValueSchema = z.coerce.string().pipe(
  z.enum([...cardIndexOptions, "-1"], {
    message: `Value must be one of ${cardIndexOptions.join(", ")} or -1 for 'no card'`,
  }),
);

type CardAtExperimentValue = (typeof cardIndexOptions)[number] | undefined;

/**
 * Hook to read the state of the sample card at the experiment (aquisition) position.
 */
export const useSampleCardAtExperiment = () => {
  const [cardAtExperiment, setCardAtExperiment] = useState<
    CardAtExperimentValue | undefined
  >(undefined);
  const [status, setStatus] = useState<
    "error" | "no card" | "loaded" | undefined
  >(undefined);
  const pvData = usePvData(cardPvName);

  useEffect(() => {
    if (!pvData) {
      setStatus("error");
      setCardAtExperiment(undefined);
      return;
    }
    const parsed = cardAtExperimentValueSchema.safeParse(pvData.value);
    if (!parsed.success) {
      setStatus("error");
      setCardAtExperiment(undefined);
      return;
    }

    if (parsed.data === "-1") {
      setStatus("no card");
      setCardAtExperiment(undefined);
    } else {
      setStatus("loaded");
      setCardAtExperiment(parsed.data);
    }
  }, [pvData]);

  return {
    cardAtExperiment,
    status,
  };
};

export function SampleCardState() {
  const { cardAtExperiment, status } = useSampleCardAtExperiment();
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
            // isError && "text-error",
            status === "error" && "text-error",
            status === "no card" && "text-online",
            status === "loaded" && "text-busy",
          )}
        >
          {status === "error" && "Error reading card state"}
          {status === "no card" && "No card at experiment"}
          {status === "loaded" && `Card ${cardAtExperiment} at experiment`}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
