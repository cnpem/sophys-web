"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { format, fromUnixTime } from "date-fns";
import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import { Button } from "@sophys-web/ui/button";
import type { HistoryItemProps } from "../lib/types";
import { DataTableColumnHeader } from "../data-table/custom-header";
import { ItemParametersCell } from "../data-table/item-parameters-cell";
import { HistoryItemDialog } from "../history-item-utils";
import { RerunButton } from "./rerun";

export const columnHelper = createColumnHelper<HistoryItemProps>();

const defaultColumns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ getValue }) => {
      const name = getValue();
      return <div className="min-w-40">{name.replace(/_/g, " ")}</div>;
    },
  }),
  columnHelper.accessor("user", {
    header: "User",
  }),
  columnHelper.accessor("kwargs", {
    header: "Params",
    cell: ({ getValue }) => {
      const params = getValue();
      return <ItemParametersCell kwargs={params} />;
    },
  }),
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
      cell: ({ getValue, row }) => {
        const status = getValue();
        return (
          <HistoryItemDialog
            item={row.original}
            className="ml-2 w-fit"
            customTrigger={
              <Badge
                className={cn("h-fit border-none bg-slate-200 text-slate-800", {
                  "bg-red-200 text-red-800": status === "failed",
                  "bg-green-200 text-green-800": status === "completed",
                  "bg-yellow-200 text-yellow-800":
                    status === "aborted" ||
                    status === "halted" ||
                    status === "stopped",
                })}
                variant="outline"
                asChild
              >
                <Button variant={"link"}>{status}</Button>
              </Badge>
            }
          />
        );
      },
    },
  ),
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
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => <RerunButton {...row.original} />,
  }),
];

export type HistoryTableColumns = ColumnDef<HistoryItemProps>[];

/**
 * Default columns for the HistoryTable component.
 * Can be extended:
 * @example
 * ```typescript
 * import { columnHelper, columns } from "@sophys-web/widgets/history-table/columns";
 * import { DataTable as HistoryTable } from "@sophys-web/widgets/history-table/data-table";
 * import type { HistoryTableColumns } from "@sophys-web/widgets/history-table/columns";
 *
 * const customColumns = [
 *   ...columns.filter((col) => col.id !== "status"),
 *   columnHelper.display({
 *     id: "status",
 *     header: "Status",
 *     cell: ({ getValue }) => <CustomStatus status={getValue()} />,
 *   }),
 * ] as HistoryTableColumns;
 *
 * function CustomHistoryTable() {
 *   return <HistoryTable columns={customColumns} />;
 * }
 * ```
 */
export const columns = defaultColumns as HistoryTableColumns;
