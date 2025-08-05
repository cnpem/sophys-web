import { z } from "zod";
import { sampleTypeOptions } from "~/lib/constants";

const name = "setup1_clean_and_acquire";

const schema = z.object({
  acquireTime: z.coerce
    .number()
    .min(0.1, "Acquire time (in seconds) must be at least 0.1"),
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
  standardOption: z.string().optional(),
  agentsList: z.array(z.string()).optional(),
  agentsDuration: z.array(z.number()).optional(),
  isRef: z.boolean(),
});

export { name, schema };
