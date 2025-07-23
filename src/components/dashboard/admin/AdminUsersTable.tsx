// components/AdminManageTable.tsx
import React from "react";
import { DataTable, DataTableColumn, RowAction } from "@/components/common/DataTable";
import { User } from "@/types/admin";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  users: User[];
  loading: boolean;
  onEdit: (userId: number) => void;
  onDelete: (userId: number) => void;
}

const AdminUsersTable: React.FC<Props> = ({ users, loading, onEdit, onDelete }) => {
  // — loading skeleton —
  if (loading) {
    return (
      <div className="overflow-x-auto border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg">
        <table className="w-full text-[15px] border-collapse">
          <thead>
            <tr className="bg-[#5781e9] dark:bg-[#3b579d]">
              <th colSpan={5} className="px-3 py-2 border border-gray-200 dark:border-zinc-700" />
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td colSpan={5}>
                  <Skeleton className="h-10 my-2 w-full rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // — column definitions —
  const columns: DataTableColumn<User>[] = [
    {
      header: "Name",
      accessor: "name",
      className: "text-left",
    },
    {
      header: "Email",
      accessor: "email",
      className: "text-left",
    },
    {
      header: "Role",
      accessor: "role",
      className: "text-left",
      render: (row) => <span className="capitalize">{row.role}</span>,
    },
    {
      header: "Created",
      accessor: "createdAt",
      className: "text-left",
      render: (row) => format(new Date(row.createdAt), "dd MMM yyyy"),
    },
  ];

  // — row actions for dropdown menu —
  const rowActions: RowAction<User>[] = [
    {
      label: "Edit",
      onClick: (row) => onEdit(row.id as number),
      icon: <Pencil size={16} />,
    },
    {
      label: "Delete",
      onClick: (row) => {
        if (
          confirm(
            "Are you sure you want to delete this user? This action cannot be undone."
          )
        ) {
          onDelete(row.id as number);
        }
      },
      icon: <Trash2 size={16} />,
      danger: true,
    },
  ];

  return (
    <div className="w-full">
      <DataTable<User>
        columns={columns}
        data={users}
        rowActions={rowActions}
        emptyText="No users found."
      />
    </div>
  );
};

export default AdminUsersTable;
