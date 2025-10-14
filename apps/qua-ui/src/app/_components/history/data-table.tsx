"use client";

import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "@sophys-web/api-client/react";
import { Button } from "@sophys-web/ui/button";
import { Input } from "@sophys-web/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sophys-web/ui/table";
import { DataTableViewOptions } from "@sophys-web/widgets/data-table/column-toggle";
import { DataTablePagination } from "@sophys-web/widgets/data-table/table-pagination";
import { columns } from "./columns";
import { FinishedItemAlertDialog } from "./finished-item-alert-dialog";

export function DataTable() {
  const { data, isPending } = api.history.get.useQuery();
  const { mutate } = api.history.clear.useMutation();

  const clearHistory = useCallback(() => {
    mutate(undefined, {
      onSuccess: () => {
        toast.success("History cleared");
      },
      onError: () => {
        toast.error("Failed to clear history");
      },
    });
  }, [mutate]);

  const tableColumns = useMemo(
    () =>
      isPending
        ? columns.map((column) => ({
            ...column,
            cell: () => (
              <div className="h-6 w-6 animate-pulse rounded-md bg-slate-200" />
            ),
          }))
        : columns,
    [isPending],
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const table = useReactTable({
    data: data?.items ?? [],
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnFilters,
      columnVisibility,
      sorting,
    },
  });

  return (
    <div className="space-y-2">
      <FinishedItemAlertDialog />
      <div className="flex items-center">
        <Input
          placeholder="Filter history items..."
          value={
            (table.getColumn("name")?.getFilterValue() as string | undefined) ??
            ""
          }
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button
          variant="ghost"
          className="ml-2"
          onClick={clearHistory}
          disabled
        >
          <XIcon className="mr-2 size-4" />
          Clear History
        </Button>
        <DataTableViewOptions table={table} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
