import { z } from "zod";
import { sampleTypeOptions } from "../../constants";

const name = "setup1_acquisition";
const schema = z.object({
  sampleTag: z.string(),
  sampleType: z.enum(sampleTypeOptions),
  bufferTag: z.string().optional(),
  numExposures: z.coerce
    .number()
    .min(1, "Number of exposures must be at least 1"),
  acquireTime: z.coerce
    .number()
    .min(0.1, "Acquire time (in seconds) must be at least 0.1"),
  temperature: z.coerce.number().positive().optional(),
  proposal: z.string(),
  isRef: z.boolean().optional(),
  metadata: z.record(z.string()).optional(),
});
export { name, schema };
