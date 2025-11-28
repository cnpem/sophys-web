import { z } from "zod";

// reference: https://blueskyproject.io/bluesky-queueserver/re_manager_api.html#status
const workerEnvironmentStateEnum = z.enum([
  "initializing",
  "failed",
  "idle",
  "executing_plan",
  "executing_task",
  "closing",
  "closed",
]);

// reference: https://blueskyproject.io/bluesky-queueserver/re_manager_api.html#status
const managerStateEnum = z.enum([
  "initializing",
  "idle",
  "paused",
  "creating_environment",
  "starting_queue",
  "executing_queue",
  "executing_task",
  "closing_environment",
  "destroying_environment",
]);

// reference: https://github.com/bluesky/bluesky/blob/main/src/bluesky/run_engine.py#L130
const reStateEnum = z.enum([
  "idle",
  "running",
  "pausing",
  "suspending",
  "paused",
  "halting",
  "stopping",
  "aborting",
  "panicked",
]);

const getResponse = z.object({
  msg: z.string().optional(),
  itemsInQueue: z.number(),
  itemsInHistory: z.number(),
  runningItemUid: z.string().nullable(),
  managerState: managerStateEnum,
  queueStopPending: z.boolean(),
  queueAutostartEnabled: z.boolean(),
  workerEnvironmentExists: z.boolean(),
  workerEnvironmentState: workerEnvironmentStateEnum,
  workerBackgroundTasks: z.number(),
  reState: reStateEnum.nullable(),
  ipKernelState: z.string().nullable(),
  ipKernelCaptured: z.boolean().nullable(),
  pausePending: z.boolean(),
  runListUid: z.string().optional(),
  planQueueUid: z.string().optional(),
  planHistoryUid: z.string().optional(),
  devicesExistingUid: z.string().optional(),
  plansExistingUid: z.string().optional(),
  devicesAllowedUid: z.string().optional(),
  plansAllowedUid: z.string().optional(),
  planQueueMode: z.object({
    loop: z.boolean(),
    ignoreFailures: z.boolean(),
  }),
  taskResultsUid: z.string().optional(),
  lockInfoUid: z.string().optional(),
  lock: z.object({
    environment: z.boolean(),
    queue: z.boolean(),
  }),
});

export default { getResponse };
