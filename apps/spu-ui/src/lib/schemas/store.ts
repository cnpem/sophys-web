import { z } from "zod";

export const schema = z.object({
  name: z.string(),
  age: z.coerce.number().int().min(0).max(120),
  email: z.string().email(),
  connectedUserNames: z.array(z.string()),
  someNumbers: z.array(z.number()),
});
