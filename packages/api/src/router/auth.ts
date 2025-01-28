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

const userSchema = z.object({
  name: z.string(),
  roles: z.array(z.string()).optional().nullable(),
  scopes: z.array(z.string()).optional().nullable(),
  proposal: z.string(),
});

export const authRouter = {
  getSession: protectedProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getUser: protectedProcedure.query(({ ctx }) => {
    const user = userSchema.safeParse({
      name: ctx.session.user.name,
      roles: ctx.session.user.roles,
      scopes: ctx.session.user.scopes,
      proposal: ctx.session.user.proposal,
    });
    if (!user.success) {
      throw new Error("Invalid user session:", user.error);
    }
    return user.data;
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
