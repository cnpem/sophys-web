import Link from "next/link";
import { ChartSplineIcon } from "lucide-react";
import type { HistoryItemProps } from "@sophys-web/widgets/history-item-utils";
import type { HistoryTableColumns } from "@sophys-web/widgets/history-table/columns";
import { Button } from "@sophys-web/ui/button";
import {
  columnHelper,
  columns,
} from "@sophys-web/widgets/history-table/columns";
import { DataTable as HistoryTable } from "@sophys-web/widgets/history-table/data-table";

function DataViewLink({ historyItem }: { historyItem: HistoryItemProps }) {
  const historyItemUid = historyItem.itemUid;
  const runUid = historyItem.result.runUids?.[0] ?? undefined;
  const queryParams = new URLSearchParams();
  if (runUid) {
    queryParams.set("runuid", runUid);
  }
  queryParams.set("historyitemuid", historyItemUid);

  const href = `/data?${queryParams.toString()}`;
  return (
    <Button
      variant="link"
      size="icon"
      className="mr-2 text-blue-500 hover:text-blue-700"
      asChild
      disabled={!runUid}
    >
      <Link href={href}>
        <ChartSplineIcon className="size-4" /> Data
      </Link>
    </Button>
  );
}

const customColumns = [
  ...columns,
  columnHelper.display({
    id: "data-view",
    cell: ({ row }) => <DataViewLink historyItem={row.original} />,
  }),
] as HistoryTableColumns;

export function CustomHistoryTable() {
  return <HistoryTable columns={customColumns} />;
}
