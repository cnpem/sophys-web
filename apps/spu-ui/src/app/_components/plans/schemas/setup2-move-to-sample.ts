import { z } from "zod";
import { cardColumns, cardRows } from "../../store/setup2/constants";

const name = "setup2_move_to_sample";

const schema = z.object({
  col: z.enum(cardColumns),
  row: z.enum(cardRows),
});
export { name, schema };
