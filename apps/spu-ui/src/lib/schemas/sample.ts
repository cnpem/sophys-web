import { z } from "zod";

export const sampleSchema = z.object({
  name: z.string(),
  order: z.coerce.number(),
  buffer: z.string(),
  time: z.coerce.number(),
  frames: z.coerce.number(),
  volume: z.coerce.number(),
  speed: z.coerce.number(),
  position: z.string(),
  energy: z.coerce.number(),
  distance: z.coerce.number(),
  detX: z.coerce.number(),
  detY: z.coerce.number(),
  comments: z.string(),
});

export const samplesSchema = z.array(sampleSchema);

export type SampleParams = z.infer<typeof sampleSchema>;
