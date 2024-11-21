import { createZodFetcher } from "zod-fetch";
import { env } from "../../env";
import commonSchemas from "../schemas/common";
import history from "../schemas/history";
import { protectedProcedure } from "../trpc";

export const historyRouter = {
  get: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/history/get`;
    const fetchWithZod = createZodFetcher();
    try {
      const res = await fetchWithZod(history.getResponseSchema, fetchURL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        },
        body: undefined,
      });
      return res;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/history/clear`;
    const fetchWithZod = createZodFetcher();
    try {
      const res = await fetchWithZod(commonSchemas.response, fetchURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        },
        body: undefined,
      });
      return res;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
} as const;
