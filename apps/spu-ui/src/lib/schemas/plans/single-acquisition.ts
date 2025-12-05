import { z } from "zod";
import { sampleTypeOptions } from "../../constants";

const name = "setup1_acquisition";
const schema = z.object({
  acquireTime: z.coerce
    .number()
    .min(0.1, "Acquire time (in seconds) must be at least 0.1"),
  numExposures: z.coerce
    .number()
    .min(1, "Number of exposures must be at least 1"),
  proposal: z.string(),
  sampleType: z.enum(sampleTypeOptions),
  sampleTag: z.string(),
  bufferTag: z.string().optional(),
  temperature: z.coerce.number().positive().optional(),
  setTemperature: z.boolean().optional(),
  isRef: z.boolean().optional(),
  usePimega: z.boolean().optional(),
  usePicolo: z.boolean().optional(),
  metadata: z.record(z.string()).optional(),
});
export { name, schema };
