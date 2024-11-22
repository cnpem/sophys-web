import { createZodFetcher } from "zod-fetch";
import { env } from "../../env";
import commonSchemas from "../schemas/common";
import { protectedProcedure } from "../trpc";

// run engine routes
// - POST re/pause
// - POST re/resume
// - POST re/stop
// - POST re/abort
// - POST re/halt
// - POST re/runs (not implemented)
// - GET re/runs/active (not implemented)
// - GET re/runs/open (not implemented)
// - GET re/runs/closed (not implemented)
export const runEngineRouter = {
  pause: protectedProcedure.mutation(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/re/pause`;
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
  resume: protectedProcedure.mutation(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/re/resume`;
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
  stop: protectedProcedure.mutation(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/re/stop`;
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
  abort: protectedProcedure.mutation(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/re/abort`;
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
  halt: protectedProcedure.mutation(async ({ ctx }) => {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/re/halt`;
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
