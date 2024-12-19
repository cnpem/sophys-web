import { z } from "zod";
import { acquireTimeOptions, sampleTypeOptions } from "../../constants";

const name = "setup1_acquisition";
const schema = z.object({
  sampleTag: z.string(),
  sampleType: z.enum(sampleTypeOptions),
  bufferTag: z.string(),
  numExposures: z.coerce
    .number()
    .min(1, "Number of exposures must be at least 1"),
  acquireTime: z.enum(acquireTimeOptions),
  temperature: z.coerce.number().positive(),
  proposal: z.string(),
  isRef: z.boolean(),
  metadata: z.record(z.string()).optional(),
});
export { name, schema };
