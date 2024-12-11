import { z } from "zod";

const name = "setup1_acquisition";
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
  proposal: z.string(),
  isRef: z.boolean(),
});
export default { name, schema };
