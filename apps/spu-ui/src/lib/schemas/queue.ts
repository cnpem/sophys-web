import type { z } from "zod";
import type { schemas } from "@sophys-web/api";

type QueueResponse = z.infer<typeof schemas.queue.getResponseSchema>;
export type QueueItem =
  | QueueResponse["items"][number]
  | QueueResponse["runningItem"];
