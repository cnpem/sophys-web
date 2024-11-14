import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "./root";
import { appRouter } from "./root";
import common from "./schemas/common";
import devices from "./schemas/devices";
import instructions from "./schemas/instructions";
import item from "./schemas/item";
import plans from "./schemas/plans";
import queue from "./schemas/queue";
import { createCallerFactory, createTRPCContext } from "./trpc";

const schemas = {
  common,
  devices,
  instructions,
  plans,
  queue,
  item,
};

/**
 * Create a server-side caller for the tRPC API
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
const createCaller = createCallerFactory(appRouter);

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
type RouterOutputs = inferRouterOutputs<AppRouter>;

export { schemas };
export { createTRPCContext, appRouter, createCaller };
export type { AppRouter, RouterInputs, RouterOutputs };
