import { createZodFetcher } from "zod-fetch";
import { env } from "../../env";
import schemas from "../schemas/status";
import { protectedProcedure } from "../trpc";

export const statusRouter = {
  get: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/status`;
    const fetchWithZod = createZodFetcher();
    try {
      const res = await fetchWithZod(schemas.getResponse, fetchURL, {
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
} as const;
