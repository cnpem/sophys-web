"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import type { ColumnDef } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { createColumnHelper } from "@tanstack/react-table";
import { GripVerticalIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import type { QueueItemProps } from "../lib/types";
import { ItemParametersCell } from "../data-table/item-parameters-cell";
import { CopyButton } from "./copy-item";
import { EditItemDialog } from "./edit-item";

function DragHandle({ id }: { id: UniqueIdentifier }) {
  const { attributes, listeners, isDragging } = useSortable({
    id,
  });
  return (
    <Button
      {...attributes}
      {...listeners}
      data-dragging={isDragging}
      variant="ghost"
      size="icon"
      className="w-fit cursor-grab data-[dragging=true]:cursor-grabbing"
    >
      <GripVerticalIcon className="text-muted-foreground size-4" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

export const columnHelper = createColumnHelper<QueueItemProps>();

const dragHandleColumn = columnHelper.display({
  id: "drag",
  header: () => "Pos",
  cell: ({ row }) => (
    <div className="text-muted-foreground flex w-fit flex-row items-center gap-2">
      <DragHandle id={row.original.itemUid} />
      <div className="text-muted-foreground text-center">{row.index}</div>
    </div>
  ),
});

const nameColumn = columnHelper.accessor("name", {
  header: "Name",
  cell: ({ getValue }) => {
    const name = getValue();
    return <div className="min-w-40">{name.replace(/_/g, " ")}</div>;
  },
});

const userColumn = columnHelper.accessor("user", {
  header: "User",
});

const paramsColumn = columnHelper.accessor("kwargs", {
  header: "Params",
  cell: ({ getValue }) => {
    const params = getValue();
    return <ItemParametersCell kwargs={params} />;
  },
});

const editColumn = columnHelper.display({
  id: "edit",
  cell: ({ row }) => <EditItemDialog item={row.original} />,
});

const copyColumn = columnHelper.display({
  id: "copy",
  cell: ({ row }) => <CopyButton {...row.original} />,
});

const deleteColumn = columnHelper.display({
  id: "delete",
});

export type QueueTableColumns = ColumnDef<QueueItemProps>[];

export const defaultColumns = [
  dragHandleColumn,
  nameColumn,
  userColumn,
  paramsColumn,
  editColumn,
  copyColumn,
  deleteColumn,
] as QueueTableColumns;

/**
 * A mapping of default columns by their IDs for easy access and extension.
 * This can be used to easily reference and extend specific columns when customizing the table.
 * @example
 * ```typescript
 * import { defaultColumnsMap } from "@sophys-web/widgets/queue-table/columns";
 * import { DataTable as QueueTable } from "@sophys-web/widgets/queue-table/data-table";
 * import type { QueueTableColumns } from "@sophys-web/widgets/queue-table/columns";
 *
 * const customColumns = [
 *   defaultColumnsMap.drag,
 *   defaultColumnsMap.name,
 *   // ... other columns
 *   {
 *    columnHelper.display({
 *      id: "edit",
 *      cell: ({ row }) => <CustomEditItemDialog item={row.original} />,
 *    }),
 *   },
 * ] as QueueTableColumns;
 *
 * function CustomQueueTable() {
 *   return <QueueTable columns={customColumns} />;
 * }
 */
export const defaultColumnsMap = {
  drag: dragHandleColumn,
  name: nameColumn,
  user: userColumn,
  params: paramsColumn,
  edit: editColumn,
  copy: copyColumn,
  delete: deleteColumn,
};
