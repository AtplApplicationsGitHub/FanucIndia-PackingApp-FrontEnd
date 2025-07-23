"use client";
import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/common/DataTable";
import { SalesOrder, Lookup } from "@/types/admin";
import { findName, formatDate } from "@/utils/sales-helpers";
import AdminOrderEditModal from "./AdminOrderEditModal";
import { MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type Props = {
  orders: SalesOrder[];
  lookup: Lookup;
  currentPage: number;
  pageSize: number;
  onDelete: (id: number) => void;
  onUpdateInline: (id: number, field: "status" | "priority" | "terminalId", value: any) => Promise<void>;
  loading: boolean;
};

const AdminOrdersTable: React.FC<Props> = ({
  orders,
  lookup,
  currentPage,
  pageSize,
  onDelete,
  onUpdateInline,
  loading,
}) => {
  // Modal state for edit
  const [editRow, setEditRow] = useState<SalesOrder | null>(null);

  // For inline editing
  const [inlineEdit, setInlineEdit] = useState<{
    id: number;
    field: "status" | "priority" | "terminalId";
    value: any;
  } | null>(null);

  const handleInlineSave = async () => {
    if (inlineEdit) {
      await onUpdateInline(inlineEdit.id, inlineEdit.field, inlineEdit.value);
      setInlineEdit(null);
    }
  };

  const columns: DataTableColumn<SalesOrder>[] = [
    {
      header: "S.I No",
      accessor: "id",
      render: (_, i) => (currentPage - 1) * pageSize + i + 1,
    },
    {
      header: "User Name",
      accessor: "user",
      render: (row) => row.user?.name || "-",
    },
    {
      header: "Product",
      accessor: "productId",
      render: (row) => findName(lookup.products, row.productId ?? 0),
    },
    {
      header: "Sales No",
      accessor: "saleOrderNumber",
      render: (row) => row.saleOrderNumber || "-",
    },
    {
      header: "OB Delivery",
      accessor: "outboundDelivery",
      render: (row) => row.outboundDelivery || "-",
    },
    {
      header: "Transfer",
      accessor: "transferOrder",
      render: (row) => row.transferOrder || "-",
    },
    {
      header: "Req. Date",
      accessor: "deliveryDate",
      render: (row) => row.deliveryDate ? formatDate(row.deliveryDate) : "-",
    },
    {
      header: "Transporter",
      accessor: "transporterId",
      render: (row) => findName(lookup.transporters, row.transporterId ?? 0),
    },
    {
      header: "Plant Code",
      accessor: "plantCodeId",
      render: (row) => findName(lookup.plantCodes, row.plantCodeId ?? 0, "code"),
    },
    {
      header: "Pay",
      accessor: "paymentClearance",
      render: (row) => (row.paymentClearance ? "Yes" : "No"),
    },
    {
      header: "Sales Zone",
      accessor: "salesZoneId",
      render: (row) => findName(lookup.salesZones, row.salesZoneId ?? 0),
    },
    {
      header: "Pack Config",
      accessor: "packConfigId",
      render: (row) => findName(lookup.packConfigs, row.packConfigId ?? 0, "configName"),
    },
    {
      header: "Customer",
      accessor: "customerId",
      render: (row) => findName(lookup.customers, row.customerId ?? 0, "name"),
    },
    // ---------------------------
    // Inline-editable columns
    // ---------------------------
    {
      header: "Status",
      accessor: "status",
      render: (row) =>
        inlineEdit && inlineEdit.id === row.id && inlineEdit.field === "status" ? (
          <input
            type="text"
            value={inlineEdit.value}
            onChange={e => setInlineEdit({ ...inlineEdit, value: e.target.value })}
            onBlur={handleInlineSave}
            onKeyDown={e => {
              if (e.key === "Enter") handleInlineSave();
              if (e.key === "Escape") setInlineEdit(null);
            }}
            autoFocus
            className="border rounded px-2 py-1 w-28 text-[15px] bg-white dark:bg-zinc-900"
            maxLength={32}
          />
        ) : (
          <span
            className="cursor-pointer hover:underline"
            onClick={() =>
              setInlineEdit({ id: row.id, field: "status", value: row.status || "" })
            }
            title="Click to edit"
          >
            {row.status || "-"}
          </span>
        ),
    },
    {
      header: "Priority",
      accessor: "priority",
      render: (row) =>
        inlineEdit && inlineEdit.id === row.id && inlineEdit.field === "priority" ? (
          <input
            type="number"
            value={inlineEdit.value}
            onChange={e => setInlineEdit({ ...inlineEdit, value: e.target.value })}
            onBlur={handleInlineSave}
            onKeyDown={e => {
              if (e.key === "Enter") handleInlineSave();
              if (e.key === "Escape") setInlineEdit(null);
            }}
            autoFocus
            className="border rounded px-2 py-1 w-16 text-[15px] bg-white dark:bg-zinc-900"
          />
        ) : (
          <span
            className="cursor-pointer hover:underline"
            onClick={() =>
              setInlineEdit({
                id: row.id,
                field: "priority",
                value: row.priority !== undefined && row.priority !== null ? row.priority : "",
              })
            }
            title="Click to edit"
          >
            {row.priority ?? "-"}
          </span>
        ),
    },
    {
      header: "Terminal",
      accessor: "terminalId",
      render: (row) =>
        inlineEdit && inlineEdit.id === row.id && inlineEdit.field === "terminalId" ? (
          <select
            value={inlineEdit.value}
            onChange={e => setInlineEdit({ ...inlineEdit, value: Number(e.target.value) })}
            onBlur={handleInlineSave}
            autoFocus
            className="border rounded px-2 py-1 w-32 text-[15px] bg-white dark:bg-zinc-900"
          >
            <option value="">Select</option>
            {lookup.terminals.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        ) : (
          <span
            className="cursor-pointer hover:underline"
            onClick={() =>
              setInlineEdit({
                id: row.id,
                field: "terminalId",
                value: row.terminalId ?? "",
              })
            }
            title="Click to edit"
          >
            {row.terminal?.name || findName(lookup.terminals, row.terminalId ?? 0) || "-"}
          </span>
        ),
    },
    {
      header: "Remarks",
      accessor: "specialRemarks",
      render: (row) => row.specialRemarks || "-",
    },
    // ---------------------------
    // Actions column (3-dots)
    // ---------------------------
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="px-2 py-0">
              <MoreVertical size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setEditRow(row)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(row.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-10",
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={orders}
      />
      {editRow && (
        <AdminOrderEditModal
          open={!!editRow}
          onClose={() => setEditRow(null)}
          order={editRow}
          lookup={lookup}
        />
      )}
    </>
  );
};

export default AdminOrdersTable;
