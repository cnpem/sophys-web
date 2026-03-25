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
  proposal: z.string().length(8),
  sampleTag: z.string(),
  sampleType: z.enum(sampleTypeOptions),
  expUvTime: z.coerce.number().nonnegative().optional(),
  measureUvNumber: z.coerce.number().int().nonnegative().optional(),
});
export { name, schema };
