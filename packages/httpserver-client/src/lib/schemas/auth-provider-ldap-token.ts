import { z } from "zod";

export const body = z.object({
  username: z.string(),
  password: z.string(),
});

export const blueskyTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  refreshTokenExpiresIn: z.number(),
  tokenType: z.string(),
});

export const response = z.object({
  success: z.boolean(),
  data: blueskyTokenSchema,
});

export default {
  body,
  response,
  blueskyTokenSchema,
};
