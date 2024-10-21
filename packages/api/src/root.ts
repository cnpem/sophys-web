import { postRouter } from "./router/post";
import { plansRouter } from "./router/plans";
import { devicesRouter } from "./router/devices";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  plans: plansRouter,
  devices: devicesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
