import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    AUTH_TRUST_HOST: z
      .string()
      // transform to boolean using preferred coercion logic
      .transform((s) => s !== "false" && s !== "0")
      .optional(),
    NODE_ENV: z.enum(["development", "production"]).optional(),
    BLUESKY_HTTPSERVER_URL: z.string().url(),
  },
  client: {},
  experimental__runtimeEnv: {},
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
