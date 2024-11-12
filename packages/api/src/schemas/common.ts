import { z } from "zod";

const response = z.object({
  success: z.boolean(),
  msg: z.string().optional(),
});

export default {
  response,
};
