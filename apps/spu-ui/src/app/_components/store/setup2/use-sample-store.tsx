import { z } from "zod";
import { useStore } from "@sophys-web/api-client/hooks";
import { cardColumns, cardIndexOptions, cardRows } from "./constants";

const STORE_INSTANCE_NAME = "sampleStoreSetup2";

export const sampleSchema = z.object({
  id: z.string(),
  sampleTag: z.string(),
  row: z.enum(cardRows),
  column: z.enum(cardColumns),
  cardIndex: z.enum(cardIndexOptions),
  samplePositionX: z.coerce.number(),
  samplePositionY: z.coerce.number(),
  meta: z.string().optional(),
});

export const useSampleStore = () =>
  useStore({
    schema: sampleSchema,
    storeInstanceName: STORE_INSTANCE_NAME,
  });

export type Sample = z.infer<typeof sampleSchema>;
export type SampleStore = ReturnType<typeof useSampleStore>["storeData"];

export function sampleIdFromPosition({
  cardIndex,
  row,
  column,
}: {
  cardIndex: (typeof cardIndexOptions)[number];
  row: (typeof cardRows)[number];
  column: (typeof cardColumns)[number];
}) {
  return `${cardIndex}-${row}-${column}`;
}
export function positionFromSampleId(sampleId: string) {
  const [cardIndex, row, column] = sampleId.split("-");
  return { cardIndex, row, column };
}
