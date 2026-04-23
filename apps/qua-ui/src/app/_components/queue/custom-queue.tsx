import type { QueueTableColumns } from "@sophys-web/widgets/queue-table/columns";
import { columnHelper, columns } from "@sophys-web/widgets/queue-table/columns";
import { DataTable as QueueTable } from "@sophys-web/widgets/queue-table/data-table";
import { CustomEditItemDialog } from "./custom-edit-item";

const customColumns = [
  ...columns.filter((col) => col.id !== "edit"),
  columnHelper.display({
    id: "edit",
    cell: ({ row }) => <CustomEditItemDialog item={row.original} />,
  }),
] as QueueTableColumns;

export function CustomQueueTable() {
  return <QueueTable columns={customColumns} />;
}
