import { z } from "zod";

const name = "setup2_move_inside_sample";

const schema = z.object({
  x: z.number(),
  y: z.number(),
});
export { name, schema };
