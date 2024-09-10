import { postRouter } from "./router/post";
import { plansRouter } from "./router/plans";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  plans: plansRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
