import type { RouterOutput } from "@sophys-web/api-client/react";

type QueueItem = RouterOutput["queue"]["get"]["items"][number];
type RunningItem = RouterOutput["queue"]["get"]["runningItem"];

export type QueueItemProps = NonNullable<QueueItem | RunningItem>;
