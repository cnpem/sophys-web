"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { format, fromUnixTime } from "date-fns";
import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import { DataTableColumnHeader } from "@sophys-web/widgets/data-table/custom-header";
import {
  itemStatusFromResult,
  statusBgVariants,
} from "@sophys-web/widgets/lib/history-item-status-utils";
import type { HistoryItemProps } from "~/lib/types";
import { RerunButton } from "./rerun";

const columnHelper = createColumnHelper<HistoryItemProps>();

const defaultColumns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ getValue }) => {
      const name = getValue();
      return <div>{name.replace(/_/g, " ")}</div>;
    },
  }),
  columnHelper.accessor("user", {
    header: "User",
  }),
  columnHelper.accessor(
    (row) => {
      const result = row.result;
      return fromUnixTime(result.timeStop);
    },
    {
      id: "time",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Finished At" />
      ),
      cell: ({ getValue }) => {
        const date = getValue();
        return (
          <div className="text-sm">{format(date, "yyyy/MM/dd HH:mm:ss")}</div>
        );
      },
    },
  ),
  columnHelper.accessor(
    (row) => {
      return itemStatusFromResult(row.result);
    },
    {
      id: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue();
        return (
          <Badge className={cn(statusBgVariants({ status }))}>{status}</Badge>
        );
      },
    },
  ),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => <RerunButton {...row.original} />,
  }),
];

export const columns = defaultColumns as ColumnDef<HistoryItemProps>[];
