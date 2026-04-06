import type { RouterOutput } from "@sophys-web/api-client/react";

type QueueItem = RouterOutput["httpserver"]["queue"]["get"]["items"][number];
type RunningItem = RouterOutput["httpserver"]["queue"]["get"]["runningItem"];

export type QueueItemProps = NonNullable<QueueItem | RunningItem>;

export type HistoryItemProps = NonNullable<
  RouterOutput["httpserver"]["history"]["get"]["items"][number]
>;
