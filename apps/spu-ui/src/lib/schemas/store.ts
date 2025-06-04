import { z } from "zod";

export const schema = z.object({
  name: z.string(),
  age: z.coerce.number().int().min(0).max(120),
  email: z.string().email(),
  //   listOfStrings: z.array(z.string()),
  //   listOfNumbers: z.array(z.number().int()),
  //   lastUpdated: z.coerce.date(),
});
