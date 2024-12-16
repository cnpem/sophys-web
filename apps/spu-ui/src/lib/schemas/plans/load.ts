import { z } from "zod";
import { trayColumns, trayOptions, trayRows } from "../../constants";

const name = "setup1_load_procedure";
const schema = z.object({
  row: z.enum(trayRows),
  col: z.enum(trayColumns),
  tray: z.enum(trayOptions),
  volume: z.coerce.number().positive(),
});
export { name, schema };
