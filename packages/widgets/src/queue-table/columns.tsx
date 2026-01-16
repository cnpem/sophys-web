"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import type { ColumnDef } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { createColumnHelper } from "@tanstack/react-table";
import { GripVerticalIcon } from "lucide-react";
import { Button } from "@sophys-web/ui/button";
import type { QueueItemProps } from "./types";
import { ItemParametersCell } from "../data-table/item-parameters-cell";
import { DeleteItem } from "./delete-item";
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

const columnHelper = createColumnHelper<QueueItemProps>();

const defaultColumns = [
  columnHelper.display({
    id: "drag",
    header: () => "Pos",
    cell: ({ row }) => (
      <div className="text-muted-foreground flex w-fit flex-row items-center gap-2">
        <DragHandle id={row.original.itemUid} />
        <div className="text-muted-foreground text-center">{row.index}</div>
      </div>
    ),
  }),
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
  columnHelper.display({
    id: "edit",
    cell: ({ row }) => <EditItemDialog item={row.original} />,
  }),
  columnHelper.display({
    id: "delete",
  }),
];

export const columns = defaultColumns as ColumnDef<QueueItemProps>[];
