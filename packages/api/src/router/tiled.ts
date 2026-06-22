import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { tiledContextProcedure } from "../trpc";

export const tiledRouter = {
  getMetadata: tiledContextProcedure
    .input(z.object({ path: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = ctx.tiledClient;
      try {
        const metadata = await client.getMetadata({ path: input.path });
        return metadata;
      } catch (error) {
        console.error("Error fetching metadata:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch metadata",
        });
      }
    }),
  getArray: tiledContextProcedure
    .input(z.object({ path: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = ctx.tiledClient;
      try {
        const data = await client.getArray({ path: input.path });
        return data;
      } catch (error) {
        console.error("Error fetching array data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch array data",
        });
      }
    }),
  getTable: tiledContextProcedure
    .input(z.object({ path: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = ctx.tiledClient;
      try {
        const data = await client.getTable({ path: input.path });
        return data;
      } catch (error) {
        console.error("Error fetching table data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch table data",
        });
      }
    }),
} as const;
