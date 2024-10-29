import { createZodFetcher } from "zod-fetch";
import { env } from "../../env";
import schemas from "../schemas/plans";
import { protectedProcedure } from "../trpc";

export const plansRouter = {
  allowed: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/plans/allowed`;
    const fetchWithZod = createZodFetcher();
    try {
      const plans = await fetchWithZod(schemas.allowed, fetchURL, {
        method: "GET",
        headers: {
          contentType: "application/json",
          Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        },
        body: undefined,
      });
      return plans.plans_allowed;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
  existing: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/plans/existing`;
    const fetchWithZod = createZodFetcher();
    try {
      const plans = await fetchWithZod(schemas.existing, fetchURL, {
        method: "GET",
        headers: {
          contentType: "application/json",
          Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        },
        body: undefined,
      });
      return plans.plans_existing;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
} as const;
