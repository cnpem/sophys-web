import type { z } from "zod";
import { schemas } from "@sophys-web/api";

const itemSubmitSchema = schemas.item.addSubmit;
export type ItemSubmit = z.infer<typeof itemSubmitSchema>;

const queueResponseSchema = schemas.queue.getResponseSchema;
type QueueResponse = z.infer<typeof queueResponseSchema>;
export type QueueItemProps =
  | QueueResponse["items"][number]
  | QueueResponse["runningItem"];
