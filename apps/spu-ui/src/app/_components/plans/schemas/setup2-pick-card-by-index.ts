import { z } from "zod";
import { cardIndexOptions } from "../../store/setup2/constants";

const name = "setup2_pick_card_by_index";

const schema = z.object({
  index: z.enum(cardIndexOptions),
});
export { name, schema };
