import { consoleOutputRouter } from "./router/console-output";
import { devicesRouter } from "./router/devices";
import { environmentRouter } from "./router/environment";
import { historyRouter } from "./router/history";
import { plansRouter } from "./router/plans";
import { postRouter } from "./router/post";
import { queueRouter } from "./router/queue";
import { runEngineRouter } from "./router/run-engine";
import { statusRouter } from "./router/status";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  plans: plansRouter,
  devices: devicesRouter,
  queue: queueRouter,
  environment: environmentRouter,
  status: statusRouter,
  consoleOutput: consoleOutputRouter,
  history: historyRouter,
  runEngine: runEngineRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
