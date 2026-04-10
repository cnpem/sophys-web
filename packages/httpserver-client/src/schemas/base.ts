import { z } from "zod";

export const requestOptionsSchema = z.object({
  httpServerUrl: z.string().url(),
  accessToken: z.string(),
});
