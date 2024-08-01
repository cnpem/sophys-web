import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";

import { env } from "../../env";

const queueItemAddSchema = z.object({
  pos: z.number(),
  item: z.object({
    name: z.string(),
    args: z.array(z.any()),
    kwargs: z.record(z.any()),
    item_type: z.string(),
  }),
});

const itemSchema = z.object({
  name: z.string(),
  args: z.array(z.any()),
  kwargs: z.record(z.any()),
  item_type: z.string(),
  user: z.string(),
  user_group: z.string(),
  item_uid: z.string().uuid(),
});

const runningItemSchema = z.object({
  name: z.string().optional(),
  args: z.array(z.any()).optional(),
  kwargs: z.object({}).passthrough().optional(),
  item_type: z.string().optional(),
  user: z.string().optional(),
  user_group: z.string().optional(),
  item_uid: z.string().optional(),
  properties: z.object({}).passthrough().optional(),
});

const queueGetResponseSchema = z.object({
  success: z.boolean(),
  msg: z.string(),
  items: z.array(itemSchema),
  running_item: runningItemSchema.optional().nullable(),
  plan_queue_uid: z.string().uuid(),
});

export const queueRouter = {
  loadAndAcquire: protectedProcedure
    .input(z.object({ spuId: z.string() }))
    .query(({ ctx, input }) => {
      return { spuId: input.spuId };
    }),
  queueItemAddSleep: protectedProcedure
    .input(z.object({ time: z.number() }).optional())
    .mutation(async ({ ctx, input }) => {
      const time = input?.time ?? 10; // default to 10 seconds     
      const inputJsonBody = JSON.stringify({
        pos: 0,
        item: {
          name: "sleep",
          args: [time],
          kwargs: {},
          item_type: "plan",
        },
      });
      const blueskyAccessToken = ctx.session.user.blueskyAccessToken;
      const res = await fetch(`${env.BLUESKY_HTTPSERVER_URL!}/api/queue/item/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${blueskyAccessToken}`,
        },
        body: inputJsonBody,
      });
      if (!res.ok) {
        throw new Error("HTTP Error: " + res.statusText);
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error("Queue Error: " + data.msg);
      }
      return { success: data.success }; 
    }),
  queueItemAdd: protectedProcedure
    .input(queueItemAddSchema)
    .mutation(async ({ ctx, input }) => {
      const inputJsonBody = JSON.stringify(input);
      const blueskyAccessToken = ctx.session.user.blueskyAccessToken;
      const res = await fetch(`${env.BLUESKY_HTTPSERVER_URL!}/api/queue/item/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${blueskyAccessToken}`,
        },
        body: inputJsonBody,
      });
      if (!res.ok) {
        throw new Error("HTTP Error: " + res.statusText);
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error("Queue Error: " + data.msg);
      }
      return { success: data.success }; 
    }),
  queueGet: publicProcedure.query(async ({ ctx }) => {
    const res = await fetch(`${env.BLUESKY_HTTPSERVER_URL!}/api/queue/get`);
    if (!res.ok) {
      throw new Error("Failed to get queue");
    }
    const data = await res.json();
    // Validate the resolved response using the schema with safeParse
    const result = queueGetResponseSchema.safeParse(data);

    if (!result.success) {
      throw new Error('Validation failed' + result.error.message);
    }

    return result.data;
  }),
  queueStart: protectedProcedure.mutation(async ({ ctx }) => {
    const blueskyAccessToken = ctx.session.user.blueskyAccessToken;
    const res = await fetch(`${env.BLUESKY_HTTPSERVER_URL!}/api/queue/start`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${blueskyAccessToken}`,
      },
    });
    if (!res.ok) {
      throw new Error("HTTP Error:" + res.statusText);
    }
    const data = await res.json();
    const parsed = z.object({ success: z.boolean(), msg: z.string().optional() }).safeParse(data);

    if (parsed.error) {
      throw new Error("Parsing Error: Failed to parse queue response: " + parsed.error.message);
    }

    if (!parsed.data.success) {
      throw new Error("Queue Error: Failed to start queue: " + parsed.data.msg);
    }

    return { success: parsed.success };
  }),
  queueStop: publicProcedure.mutation(async ({ ctx }) => {
    const res = await fetch(`${env.BLUESKY_HTTPSERVER_URL!}/api/queue/stop`, {
      method: "POST",
    });
    if (!res.ok) {
      throw new Error("Failed to stop queue");
    }
    return { success: true };
  }),
  queueClear: publicProcedure.mutation(async ({ ctx }) => {
    const res = await fetch(`${env.BLUESKY_HTTPSERVER_URL!}/api/queue/clear`, {
      method: "POST",
    });
    if (!res.ok) {
      throw new Error("Failed to clear queue");
    }
    return { success: true };
  }),
} satisfies TRPCRouterRecord;
