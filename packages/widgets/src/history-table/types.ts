import type { RouterOutput } from "@sophys-web/api-client/react";

export type HistoryItemProps = NonNullable<
  RouterOutput["history"]["get"]["items"][number]
>;
