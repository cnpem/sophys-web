import { z } from "zod";

const name = "setup1_clean_and_acquire";

// TODO: this shouldn't be hardcoded in the UI
const defaults = {
  acquireTime: 100,
  numExposures: 1,
  volume: 0,
  sampleTag: "capillary",
  bufferTag: "none",
  standardOption: "heavy",
  isRef: true,
};

const schema = z.object({
  acquireTime: z.number(),
  numExposures: z.number(),
  volume: z.number(),
  proposal: z.string(),
  sampleTag: z.string(),
  bufferTag: z.string(),
  standardOption: z.string().nullable(),
  agentsList: z.array(z.string()).optional(),
  agentsDuration: z.array(z.number()).optional(),
  isRef: z.boolean(),
});

export { name, schema, defaults };
