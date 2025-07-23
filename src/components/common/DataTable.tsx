import React from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

export type DataTableColumn<T> = {
  header: React.ReactNode;
  accessor: keyof T | string;
  render?: (row: T, idx: number) => React.ReactNode; // Custom cell renderer
  className?: string;
};

export type RowAction<T> = {
  label: string;
  onClick: (row: T) => void;
  icon?: React.ReactNode;
  danger?: boolean;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  rowActions?: RowAction<T>[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    onPageChange: (page: number) => void;
  };
  emptyText?: string;
};

export function DataTable<T extends { id: number | string }>({
  columns,
  data,
  rowActions,
  pagination,
  emptyText = "No records found.",
}: DataTableProps<T>) {
  const thClass = "px-3 py-2 border border-gray-200 dark:border-zinc-700 text-center whitespace-nowrap";
  const tdClass = "px-3 py-2 border border-gray-200 dark:border-zinc-700 text-center";

  return (
    <div className="w-full">
      <table className="w-full text-left text-[15px] border-collapse">
        <thead>
          <tr className="bg-[#5781e9] dark:bg-[#3b579d]">
            {columns.map((col, i) => (
              <th key={i} className={thClass + " " + (col.className || "")}>{col.header}</th>
            ))}
            {rowActions && <th className={thClass}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className={tdClass} colSpan={columns.length + (rowActions ? 1 : 0)}>
                <div className="text-center py-8 text-gray-500 dark:text-zinc-400">{emptyText}</div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id} className="border-b hover:bg-blue-50 dark:hover:bg-zinc-800">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={tdClass + " " + (col.className || "")}>
                    {col.render
                      ? col.render(row, idx)
                      : (row as any)[col.accessor]}
                  </td>
                ))}
                {rowActions && (
                  <td className={tdClass}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Open menu">
                          <MoreVertical size={20} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={5}>
                        {rowActions.map((action, ai) => (
                          <DropdownMenuItem
                            key={ai}
                            onClick={() => action.onClick(row)}
                            className={action.danger ? "text-red-600" : ""}
                          >
                            {action.icon}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 px-2">
          <span className="text-sm text-gray-700">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of{" "}
            {pagination.totalCount}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded bg-gray-200 dark:bg-zinc-700 disabled:opacity-50"
              disabled={pagination.currentPage === 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              {"<"}
            </button>
            <span className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              className="p-2 rounded bg-gray-200 dark:bg-zinc-700 disabled:opacity-50"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              {">"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
