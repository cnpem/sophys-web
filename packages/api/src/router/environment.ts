import { createZodFetcher } from "zod-fetch";
import { env } from "../../env";
import commonSchemas from "../schemas/common";
import { protectedProcedure } from "../trpc";

export const environmentRouter = {
  open: protectedProcedure.mutation(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/environment/open`;
    const fetchWithZod = createZodFetcher();
    try {
      const response = await fetchWithZod(commonSchemas.response, fetchURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        },
        body: "{}",
      });
      return response;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
  close: protectedProcedure.mutation(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/environment/close`;
    const fetchWithZod = createZodFetcher();
    try {
      const response = await fetchWithZod(commonSchemas.response, fetchURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        },
        body: "{}",
      });
      return response;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
  update: protectedProcedure.mutation(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/environment/update`;
    const fetchWithZod = createZodFetcher();
    try {
      const response = await fetchWithZod(commonSchemas.response, fetchURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        },
        body: "{}",
      });
      return response;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
  destroy: protectedProcedure.mutation(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/environment/destroy`;
    const fetchWithZod = createZodFetcher();
    try {
      const response = await fetchWithZod(commonSchemas.response, fetchURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        },
        body: "{}",
      });
      return response;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
} as const;
