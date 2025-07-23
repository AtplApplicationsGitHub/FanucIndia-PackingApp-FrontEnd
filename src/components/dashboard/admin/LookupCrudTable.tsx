// components/LookupCrudTable.tsx
"use client";

import React from "react";
import { DataTable, DataTableColumn } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Menu } from "@headlessui/react";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Save,
  X,
  PlusCircle,
  RefreshCcw,
} from "lucide-react";

export type LookupRow = {
  id: number;
  [key: string]: string | number | boolean | null | undefined;
};

type Props = {
  type: string;
  data: LookupRow[];
  editingId: number | null;
  editObj: Partial<LookupRow>;
  onEdit: (id: number, row: LookupRow) => void;
  onEditChange: (
    key: string,
    value: string | number | boolean | null | undefined
  ) => void;
  onSave: (type: string, id: number) => void;
  onRequestDelete: (type: string, id: number) => void;
  onCancel: () => void;
  onAdd: (type: string) => void; // renamed from onStartAdd
  addObj: Partial<LookupRow>;
  onAddChange: (
    key: string,
    value: string | number | boolean | null | undefined
  ) => void;
  adding: boolean;
  refresh: () => void;
};

const ADD_ROW_ID = -1;

const LookupCrudTable: React.FC<Props> = ({
  type,
  data,
  editingId,
  editObj,
  onEdit,
  onEditChange,
  onSave,
  onRequestDelete,
  onCancel,
  addObj,
  onAdd,
  onAddChange,
  adding,
  refresh,
}) => {
  // derive column keys (exclude timestamps)
  const keys = data[0]
    ? Object.keys(data[0]).filter(
        (col) => col !== "createdAt" && col !== "updatedAt"
      )
    : [];

  const activeEditId = adding ? ADD_ROW_ID : editingId;
  const rows: LookupRow[] = adding
    ? [...data, { id: ADD_ROW_ID, ...addObj } as LookupRow]
    : data;

  const columns: DataTableColumn<LookupRow>[] = keys.map((col) => ({
    header: col,
    accessor: col,
    className: col === "id" ? "text-center" : "",
    render: (row) => {
      if (activeEditId === row.id && col !== "id") {
        const value = row.id === ADD_ROW_ID ? addObj[col] : editObj[col];
        const handleChange = row.id === ADD_ROW_ID ? onAddChange : onEditChange;
        return (
          <input
            value={typeof value === "boolean" ? String(value) : value ?? ""}
            onChange={(e) => handleChange(col, e.target.value)}
            className="border rounded px-2 py-1 bg-white dark:bg-zinc-900 w-full"
            placeholder={col}
            disabled={!!editingId && !adding}
          />
        );
      }

      if (col === "id") {
        return row.id === ADD_ROW_ID ? "Auto" : row[col];
      }

      return String(row[col]);
    },
  }));

  const actionColumn: DataTableColumn<LookupRow> = {
    header: "Actions",
    accessor: "actions",
    className: "text-center",
    render: (row) => {
      if (activeEditId === row.id) {
        // disable save if new row has missing required fields
        const isIncomplete =
          row.id === ADD_ROW_ID &&
          keys
            .filter((k) => k !== "id")
            .some(
              (k) =>
                typeof addObj[k] !== "string" || !addObj[k]?.toString().trim()
            );

        return (
          <div className="flex justify-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onSave(type, row.id)}
              disabled={isIncomplete}
              aria-label="Save"
            >
              <Save size={18} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onCancel}
              aria-label="Cancel"
            >
              <X size={18} />
            </Button>
          </div>
        );
      }

      return (
        <div className="flex justify-center">
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <MoreVertical size={20} />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-32 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-lg z-10">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => onEdit(row.id, row)}
                    className={`${
                      active ? "bg-gray-100 dark:bg-zinc-800" : ""
                    } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-zinc-200`}
                  >
                    <Pencil size={16} className="mr-2" />
                    Edit
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => onRequestDelete(type, row.id)}
                    className={`${
                      active ? "bg-gray-100 dark:bg-zinc-800" : ""
                    } flex items-center w-full px-4 py-2 text-sm text-red-600`}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      );
    },
  };

  return (
    <div className="w-full">
      <div className="flex justify-end items-center mb-4 gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAdd(type)}
          disabled={adding}
          aria-label={`Add ${type}`}
        >
          <PlusCircle size={18} className="mr-2" />
          Add
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={refresh}
          aria-label="Refresh"
        >
          <RefreshCcw size={18} className="mr-2" />
          Refresh
        </Button>
      </div>

      <DataTable<LookupRow>
        columns={[...columns, actionColumn]}
        data={rows}
        emptyText="No items found."
      />
    </div>
  );
};

export default LookupCrudTable;
