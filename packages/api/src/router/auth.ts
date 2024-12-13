import { z } from "zod";
import { env } from "../../env";
import { protectedProcedure } from "../trpc";
import { zodSnakeFetcher } from "../utils";

const principalSchema = z.object({
  uuid: z.string(),
  type: z.enum(["user", "service"]),
  identities: z.array(
    z.object({
      provider: z.string(),
      id: z.string(),
      latestLogin: z.string().optional().nullable(),
    }),
  ),
  apiKeys: z.array(
    z.object({
      firstEight: z.string(),
      expirationTime: z.string().optional().nullable(),
      note: z.string().optional().nullable(),
      scopes: z.array(z.string()),
      latestActivity: z.string().optional().nullable(),
    }),
  ),
  sessions: z.array(
    z.object({
      uuid: z.string(),
      expirationTime: z.string(),
      revoked: z.boolean(),
    }),
  ),
  latestActivity: z.string().nullable(),
  roles: z.array(z.string()).nullable(),
  scopes: z.array(z.string()).nullable(),
  apiKeyScopes: z.array(z.string()).nullable(),
});

export const authRouter = {
  getSession: protectedProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  whoAmI: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/auth/whoami`;
    const blueskyAccessToken = ctx.session.user.blueskyAccessToken;
    try {
      const res = await zodSnakeFetcher(principalSchema, {
        url: fetchURL,
        method: "GET",
        authorization: `Bearer ${blueskyAccessToken}`,
        body: undefined,
      });
      return res;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
};
