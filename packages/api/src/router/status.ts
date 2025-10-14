import { env } from "../../env";
import schemas from "../schemas/status";
import { protectedProcedure } from "../trpc";
import { zodSnakeFetcher } from "../utils";

export const statusRouter = {
  get: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/status`;
    try {
      const res = await zodSnakeFetcher(schemas.getResponse, {
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
