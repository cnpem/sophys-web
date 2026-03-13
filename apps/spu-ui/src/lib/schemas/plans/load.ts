import { z } from "zod";
import {
  sampleTypeOptions,
  trayColumns,
  trayOptions,
  trayRows,
} from "../../constants";

const name = "setup1_load_procedure";
const schema = z.object({
  row: z.enum(trayRows),
  col: z.enum(trayColumns),
  tray: z.enum(trayOptions),
  volume: z.coerce
    .number()
    .positive()
    .max(100, "Volume must be between 0 and 100 µL"),
  metadata: z
    .object({
      sampleType: z.enum(sampleTypeOptions),
      sampleTag: z.string(),
      bufferTag: z.string().optional(),
    })
    .optional(),
});
export { name, schema };
