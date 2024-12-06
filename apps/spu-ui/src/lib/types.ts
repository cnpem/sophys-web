import type { z } from "zod";
import type { schemas } from "@sophys-web/api";

export type ItemSubmit = z.infer<typeof schemas.item.addSubmit>;

type QueueResponse = z.infer<typeof schemas.queue.getResponseSchema>;
export type QueueItemProps =
  | QueueResponse["items"][number]
  | QueueResponse["runningItem"];

type HistoryResponse = z.infer<typeof schemas.history.getResponseSchema>;
export type HistoryItemProps = HistoryResponse["items"][number];
