import { env } from "../../env";
import commonSchemas from "../schemas/common";
import history from "../schemas/history";
import { protectedProcedure } from "../trpc";
import { zodSnakeFetcher } from "../utils";

export const historyRouter = {
  get: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/history/get`;
    try {
      const res = await zodSnakeFetcher(history.getResponseSchema, {
        url: fetchURL,
        method: "GET",
        body: undefined,
        authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
      });
      if (!res.success) {
        throw new Error(res.msg);
      }
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
    try {
      const res = await zodSnakeFetcher(commonSchemas.response, {
        url: fetchURL,
        method: "POST",
        body: undefined,
        authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
      });
      if (!res.success) {
        throw new Error(res.msg);
      }
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
