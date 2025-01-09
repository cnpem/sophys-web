// import { createZodFetcher } from "zod-fetch";
import { env } from "../../env";
import schemas from "../schemas/plans";
import { protectedProcedure } from "../trpc";
import { zodSnakeFetcher } from "../utils";

export const plansRouter = {
  allowed: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/plans/allowed`;
    try {
      const res = await zodSnakeFetcher(schemas.allowed, {
        url: fetchURL,
        method: "GET",
        authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
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
  existing: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/plans/existing`;
    try {
      const res = await zodSnakeFetcher(schemas.existing, {
        url: fetchURL,
        method: "GET",
        authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
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
} as const;
