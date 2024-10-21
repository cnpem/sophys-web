import { devicesRouter } from "./router/devices";
import { plansRouter } from "./router/plans";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  plans: plansRouter,
  devices: devicesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
