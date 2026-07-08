import { z } from "zod";

export const response = z.object({
  success: z.boolean(),
  data: z.object({
    roles: z.array(z.string()),
    scopes: z.array(z.string()),
  }),
});

const body = z.object({});

export default {
  body,
  response,
};
