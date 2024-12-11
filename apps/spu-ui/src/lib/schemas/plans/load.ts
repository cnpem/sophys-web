import { z } from "zod";

const name = "setup1_load_procedure";
const schema = z.object({
  row: z.string(),
  col: z.number(),
  tray: z.string(),
  volume: z.number(),
});
export { name, schema };
