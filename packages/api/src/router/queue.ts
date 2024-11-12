import { createZodFetcher } from "zod-fetch";
import { env } from "../../env";
import commonSchemas from "../schemas/common";
import item from "../schemas/item";
import queue from "../schemas/queue";
import { protectedProcedure } from "../trpc";

const itemRouter = {
  add: protectedProcedure
    .input(item.addSubmit)
    .mutation(async ({ ctx, input }) => {
      const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/queue/item/add`;
      const fetchWithZod = createZodFetcher();
      const body = JSON.stringify(input);
      try {
        const res = await fetchWithZod(item.addResponse, fetchURL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
          },
          body,
        });
        if (res.success === false) {
          throw new Error(res.msg);
        }
        return res;
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
          throw new Error(e.message);
        }
        console.error("Unknown error", e);
        throw new Error("Unknown error");
      }
    }),
  remove: protectedProcedure
    .input(item.removeSubmit)
    .mutation(async ({ ctx, input }) => {
      const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/queue/item/remove`;
      const fetchWithZod = createZodFetcher();
      const body = JSON.stringify(input);
      try {
        const res = await fetchWithZod(commonSchemas.response, fetchURL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
          },
          body,
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

export const queueRouter = {
  item: itemRouter,
  get: protectedProcedure.query(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/queue/get`;
    const fetchWithZod = createZodFetcher();
    try {
      const res = await fetchWithZod(queue.getResponseSchema, fetchURL, {
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
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
  start: protectedProcedure.mutation(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/queue/start`;
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
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
  stop: protectedProcedure.mutation(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/queue/stop`;
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
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/queue/clear`;
    const fetchWithZod = createZodFetcher();
    try {
      const res = await fetchWithZod(commonSchemas.response, fetchURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        },
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
