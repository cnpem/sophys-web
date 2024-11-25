import type { z } from "zod";
import { schemas } from "@sophys-web/api";

const responseSchema = schemas.queue.getResponseSchema;
type QueueResponse = z.infer<typeof responseSchema>;
export type QueueItem =
  | QueueResponse["items"][number]
  | QueueResponse["runningItem"];
