import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";

export const postRouter = {
  hello: publicProcedure
    .input(z.object({ message: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello, ${input.message}` };
    }),
  secret: protectedProcedure.query(({ ctx }) => {
    const user = ctx.session.user;

    return { secret: `Only ${user.name} can see this` };
  }),
} satisfies TRPCRouterRecord;
