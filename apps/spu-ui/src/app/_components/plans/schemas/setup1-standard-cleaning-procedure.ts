import { z } from "zod";
import { standardCleaningOptions } from "~/app/_components/store/setup1/constants";

const name = "setup1_standard_cleaning_procedure";
const schema = z.object({
  standardOption: z.enum(standardCleaningOptions, {
    message: "Standard option must be one of 'light', 'normal', or 'heavy'",
  }),
});

export { name, schema };
