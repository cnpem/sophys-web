import { z } from "zod";
import { acquireTimeOptions, sampleTypeOptions } from "~/lib/constants";

const name = "setup1_clean_and_acquire";

const schema = z.object({
  acquireTime: z.coerce
    .string()
    .transform((val) => val.trimStart().trimEnd().replace(",", "."))
    .pipe(
      z.enum(acquireTimeOptions, {
        message: `Acquire time (ms) must be one of the following options ${acquireTimeOptions.join(", ")}`,
      }),
    ),
  sampleType: z
    .string()
    .transform((val) => val.trimStart().trimEnd())
    .pipe(
      z.enum(sampleTypeOptions, {
        message: "Sample type must be either 'buffer' or 'sample'",
      }),
    ),
  numExposures: z.coerce.number(),
  proposal: z.string(),
  sampleTag: z.string(),
  bufferTag: z.string(),
  standardOption: z.string().optional(),
  agentsList: z.array(z.string()).optional(),
  agentsDuration: z.array(z.number()).optional(),
  isRef: z.boolean(),
});

export { name, schema };
