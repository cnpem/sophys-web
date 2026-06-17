import { authRouter } from "./router/auth";
import { consoleOutputRouter } from "./router/httpserver/console-output";
import { devicesRouter } from "./router/httpserver/devices";
import { environmentRouter } from "./router/httpserver/environment";
import { historyRouter } from "./router/httpserver/history";
import { plansRouter } from "./router/httpserver/plans";
import { queueRouter } from "./router/httpserver/queue";
import { runEngineRouter } from "./router/httpserver/run-engine";
import { statusRouter } from "./router/httpserver/status";
import { redisHashStore } from "./router/redisHashStore";
import { tiledRouter } from "./router/tiled";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  httpserver: {
    queue: queueRouter,
    history: historyRouter,
    runEngine: runEngineRouter,
    status: statusRouter,
    environment: environmentRouter,
    devices: devicesRouter,
    plans: plansRouter,
    consoleOutput: consoleOutputRouter,
    auth: authRouter,
  } as const,
  auth: authRouter,
  store: redisHashStore,
  tiled: tiledRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
