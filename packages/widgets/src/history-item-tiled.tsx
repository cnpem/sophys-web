import { api } from "@sophys-web/api-client/react";
import type { HistoryItemProps } from "./history-item-utils";

export function HistoryItemTiledViewer({ item }: { item: HistoryItemProps }) {
  const runUid = item.result.runUids?.[0];

  if (!runUid) {
    return null;
  }

  return <TiledViewer runUid={runUid} />;
}

function TiledViewer({ runUid }: { runUid: string }) {
  const { data, isPending } = api.tiled.getMetadata.useQuery({
    path: `/${runUid}`,
  });

  if (isPending) {
    return (
      <div className="h-32 w-full animate-pulse rounded-md bg-slate-200" />
    );
  }

  if (!data) {
    return (
      <div className="text-muted-foreground text-sm">
        No data available for {runUid}
      </div>
    );
  }

  return (
    <div className="flex w-fit flex-col items-start gap-2">
      <div className="text-sm font-semibold">Tiled Metadata for {runUid}:</div>
      <pre className="overflow-wrap w-[600px] rounded-md bg-gray-100 p-2 text-sm whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
