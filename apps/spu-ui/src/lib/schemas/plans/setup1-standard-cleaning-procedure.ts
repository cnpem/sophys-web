import { z } from "zod";

const name = "setup1_standard_cleaning_procedure";
const schema = z.object({
  standardOption: z.enum(["light", "normal", "heavy"], {
    message: "Standard option must be one of 'light', 'normal', or 'heavy'",
  }),
});

export { name, schema };
