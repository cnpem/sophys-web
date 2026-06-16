import { z } from "zod";
import { useStore } from "@sophys-web/api-client/hooks";
import {
  sampleTypeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "./constants";

const STORE_INSTANCE_NAME = "sampleStoreSetup1";

export const sampleSchema = z.object({
  id: z.string(),
  relativePosition: z.string(),
  sampleTag: z.string(),
  bufferTag: z.string(),
  sampleType: z.enum(sampleTypeOptions),
  row: z.enum(trayRows),
  col: z.enum(trayColumns),
  tray: z.enum(trayOptions),
  volume: z.number().min(0),
  meta: z.string().optional(),
});

export const useSampleStore = () =>
  useStore({
    schema: sampleSchema,
    storeInstanceName: STORE_INSTANCE_NAME,
  });

export type Sample = z.infer<typeof sampleSchema>;
export type SampleStore = ReturnType<typeof useSampleStore>["storeData"];

export function sampleIdFromPosition(tray: string, row: string, col: string) {
  return `${tray}-${row}-${col}`;
}
export function positionFromSampleId(sampleId: string) {
  const [tray, row, col] = sampleId.split("-");
  return { tray, row, col };
}
