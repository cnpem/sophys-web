import { env } from "../../env";
import commonSchemas from "../schemas/common";
import item from "../schemas/item";
import queue from "../schemas/queue";
import { protectedProcedure } from "../trpc";
import { zodSnakeFetcher } from "../utils";

const itemRouter = {
  add: protectedProcedure
    .input(item.addSubmit)
    .mutation(async ({ ctx, input }) => {
      const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/queue/item/add`;
      const body = input;
      try {
        const res = await zodSnakeFetcher(item.addResponse, {
          url: fetchURL,
          method: "POST",
          body,
          authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        });
        if (!res.success) {
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
  execute: protectedProcedure
    .input(item.addSubmit)
    .mutation(async ({ ctx, input }) => {
      const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/queue/item/execute`;
      const body = input;
      try {
        const res = await zodSnakeFetcher(item.addResponse, {
          url: fetchURL,
          method: "POST",
          body,
          authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        });
        if (!res.success) {
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
      try {
        const res = await zodSnakeFetcher(commonSchemas.response, {
          url: fetchURL,
          method: "POST",
          body: input,
          authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        });
        if (!res.success) {
          throw new Error(res.msg);
        }
        return res;
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(e.message);
        }
        throw new Error("Unknown error");
      }
    }),
  addBatch: protectedProcedure
    .input(item.addBatchSubmit)
    .mutation(async ({ ctx, input }) => {
      const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/queue/item/add/batch`;
      try {
        const res = await zodSnakeFetcher(item.addBatchResponse, {
          url: fetchURL,
          method: "POST",
          body: input,
          authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        });
        if (!res.success) {
          console.error(`Httpserver error: ${res.msg}`);
          throw new Error(JSON.stringify(res.results));
        }
        return res;
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(e.message);
        }
        console.error("Unknown error", e);
        throw new Error("Unknown error");
      }
    }),
  update: protectedProcedure
    .input(item.updateSubmit)
    .mutation(async ({ ctx, input }) => {
      const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/queue/item/update`;
      try {
        const res = await zodSnakeFetcher(item.updateResponse, {
          url: fetchURL,
          method: "POST",
          body: input,
          authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        });
        if (!res.success) {
          throw new Error(res.msg);
        }
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
    try {
      const res = await zodSnakeFetcher(queue.getResponseSchema, {
        url: fetchURL,
        method: "GET",
        authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        body: undefined,
      });
      if (!res.success) {
        throw new Error(res.msg);
      }
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
    try {
      const res = await zodSnakeFetcher(commonSchemas.response, {
        url: fetchURL,
        method: "POST",
        authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        body: undefined,
      });
      if (!res.success) {
        throw new Error(res.msg);
      }
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
    try {
      const res = await zodSnakeFetcher(commonSchemas.response, {
        url: fetchURL,
        method: "POST",
        authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        body: undefined,
      });
      if (!res.success) {
        throw new Error(res.msg);
      }
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
    try {
      const res = await zodSnakeFetcher(commonSchemas.response, {
        url: fetchURL,
        method: "POST",
        authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
        body: undefined,
      });
      if (!res.success) {
        throw new Error(res.msg);
      }
      return res;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unknown error");
    }
  }),
} as const;
