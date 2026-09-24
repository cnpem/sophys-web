"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import type { ColumnDef } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";
import { createColumnHelper } from "@tanstack/react-table";
import { GripVerticalIcon } from "lucide-react";
import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import { Button } from "@sophys-web/ui/button";
import type { QueueItemProps } from "~/lib/types";
import { RowActions } from "./row-actions";

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
      className="cursor-grab data-[dragging=true]:cursor-grabbing"
    >
      <GripVerticalIcon className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columnHelper = createColumnHelper<QueueItemProps>();

const defaultColumns = [
  columnHelper.display({
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.itemUid} />,
  }),
  columnHelper.display({
    id: "position",
    header: "Position",
    cell: ({ row }) => <div>{row.index}</div>,
  }),
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
  columnHelper.accessor("itemType", {
    header: "Type",
    cell: ({ getValue }) => {
      const type = getValue();
      return <Badge variant="outline">{type}</Badge>;
    },
  }),
  columnHelper.accessor(
    (row) => {
      const result = row.result;
      const id = row.itemUid;

      if (id.includes("optimistic")) {
        return "enqueing";
      }
      if (!result) {
        return "enqueued";
      }
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
              "bg-slate-200 text-slate-800": status === "enqueued",
              "bg-blue-200 text-blue-800": status === "running",
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
    cell: ({ row }) => <RowActions item={row.original} />,
  }),
];

export const columns = defaultColumns as ColumnDef<QueueItemProps>[];
