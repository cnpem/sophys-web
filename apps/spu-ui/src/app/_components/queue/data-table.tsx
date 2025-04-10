"use client";

import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import type {
  ColumnFiltersState,
  Row,
  VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { useQueue } from "@sophys-web/api-client/hooks";
import { Input } from "@sophys-web/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@sophys-web/ui/table";
import type { QueueItemProps } from "../../../lib/types";
import { DataTableViewOptions } from "../data-table/column-toggle";
import { DataTablePagination } from "../data-table/table-pagination";
import { columns } from "./columns";
import { TableTools } from "./table-tools";

function DraggableRow({
  row,
  moving,
}: {
  row: Row<QueueItemProps>;
  moving?: boolean;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.itemUid,
  });
  return (
    <TableRow
      data-dragging={isDragging}
      data-moving={moving}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 data-[moving=true]:opacity-50"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable() {
  const { queue, move } = useQueue();
  const [data, setData] = useState<QueueItemProps[]>([]);

  useEffect(() => {
    setData(queue.data?.items ?? ([] as QueueItemProps[]));
  }, [queue.data]);

  const isEmpty = queue.data?.items.length === 0;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (isEmpty) {
      return;
    }
    if (!over) {
      return;
    }
    if (active.id !== over.id) {
      const fromIndex = data.findIndex((item) => item.itemUid === active.id);
      const toIndex = data.findIndex((item) => item.itemUid === over.id);
      setData((sortedItems) => arrayMove(sortedItems, fromIndex, toIndex));
      move.mutate(
        {
          uid: active.id as string,
          posDest: toIndex,
        },
        {
          onSuccess: () => {
            toast.success("Item moved");
          },
          onError: () => {
            toast.error("Failed to move item");
          },
        },
      );
    }
  };
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const tableColumns = useMemo(
    () =>
      queue.isPending
        ? columns.map((column) => ({
            ...column,
            cell: () => (
              <div className="h-6 w-6 animate-pulse rounded-md bg-slate-200" />
            ),
          }))
        : columns,
    [queue.isPending],
  );
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data.map(({ itemUid }) => itemUid),
    [data],
  );

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter queue items..."
          value={
            (table.getColumn("name")?.getFilterValue() as string | undefined) ??
            ""
          }
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <TableTools />
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
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
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows.length ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow
                      key={row.id}
                      row={row}
                      moving={move.isPending}
                    />
                  ))}
                </SortableContext>
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
        </DndContext>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
