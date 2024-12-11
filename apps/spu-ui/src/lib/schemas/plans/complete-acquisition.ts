import { z } from "zod";

const name = "setup1_complete_standard_acquisition";
const schema = z.object({
  sampleTag: z.string(),
  sampleType: z.string(),
  bufferTag: z.string(),
  tray: z.string(),
  row: z.string(),
  col: z.number(),
  volume: z.number(),
  acquireTime: z.number(),
  numExposures: z.number(),
  expUvTime: z.number(),
  measureUvNumber: z.number(),
  standardOption: z.string().optional(),
  agentsList: z.array(z.string()).optional(),
  agentsDuration: z.array(z.number()).optional(),
  proposal: z.string(),
});
export { name, schema };
export type PlanKwargs = z.infer<typeof schema>;
