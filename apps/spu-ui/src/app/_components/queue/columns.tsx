"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";
import { cn } from "@sophys-web/ui";
import { Badge } from "@sophys-web/ui/badge";
import { Button } from "@sophys-web/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@sophys-web/ui/dropdown-menu";
import type { QueueItemProps } from "~/lib/types";

const columnHelper = createColumnHelper<QueueItemProps>();

const defaultColumns = [
  columnHelper.display({
    id: "position",
    header: "Position",
    cell: ({ row }) => <div>{row.index}</div>,
  }),
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("user", {
    header: "User",
  }),
  columnHelper.accessor("itemType", {
    header: "Type",
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
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit Item</DropdownMenuItem>
            <DropdownMenuItem>Remove Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
];

export const columns = defaultColumns as ColumnDef<QueueItemProps>[];
