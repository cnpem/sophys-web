import type { QueueTableColumns } from "@sophys-web/widgets/queue-table/columns";
import {
  columnHelper,
  defaultColumnsMap,
} from "@sophys-web/widgets/queue-table/columns";
import { DataTable as QueueTable } from "@sophys-web/widgets/queue-table/data-table";
import { CustomEditItemDialog } from "./custom-edit-item";

const customColumns = [
  defaultColumnsMap.drag,
  defaultColumnsMap.name,
  defaultColumnsMap.user,
  defaultColumnsMap.params,
  columnHelper.display({
    id: "edit",
    cell: ({ row }) => <CustomEditItemDialog item={row.original} />,
  }),
  defaultColumnsMap.copy,
  defaultColumnsMap.delete,
] as QueueTableColumns;

export function CustomQueueTable() {
  return <QueueTable columns={customColumns} />;
}
