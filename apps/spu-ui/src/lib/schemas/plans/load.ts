import { z } from "zod";

export const planName = "setup1_load_procedure";

export const kwargsResponseSchema = z.object({
  row: z.string(),
  col: z.number(),
  tray: z.string(),
  volume: z.number(),
});

export const kwargsSubmitSchema = kwargsResponseSchema;
