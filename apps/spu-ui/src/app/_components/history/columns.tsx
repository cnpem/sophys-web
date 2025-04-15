"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { format, fromUnixTime } from "date-fns";
import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import type { HistoryItemProps } from "~/lib/types";
import { DataTableColumnHeader } from "../data-table/custom-header";
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
      const result = row.result;
      if (result.traceback) {
        return result.exitStatus ?? "failed";
      }
      return result.exitStatus ?? "finished";
    },
    {
      id: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue();
        return (
          <Badge
            className={cn("border-none bg-slate-200 text-slate-800", {
              "bg-red-200 text-red-800": status === "failed",
              "bg-green-200 text-green-800": status === "completed",
              "bg-yellow-200 text-yellow-800":
                status === "aborted" ||
                status === "halted" ||
                status === "stopped",
            })}
            variant="outline"
          >
            {status}
          </Badge>
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
