"use client";
import { useState } from "react";
import { SalesOrder, Lookup } from "@/types/admin";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API } from "@/lib/api";
import { toast } from "sonner";

type OptionItem = { id: string | number; name?: string; code?: string; configName?: string };
type FieldOption = keyof Lookup | OptionItem[];

function normalizeInputValue(val: unknown): string | number {
  if (val === null || val === undefined) return "";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "object") return "";
  return val as string | number;
}

type Props = {
  open: boolean;
  onClose: () => void;
  order: SalesOrder;
  lookup: Lookup;
};

const FIELDS: {
  key: keyof SalesOrder;
  label: string;
  type?: string;
  options?: FieldOption;
  disabled?: boolean;
}[] = [
  { key: "productId", label: "Product", type: "select", options: "products" },
  { key: "saleOrderNumber", label: "Sales No" },
  { key: "outboundDelivery", label: "OB Delivery" },
  { key: "transferOrder", label: "Transfer" },
  { key: "transporterId", label: "Transporter", type: "select", options: "transporters" },
  { key: "plantCodeId", label: "Plant Code", type: "select", options: "plantCodes" },
  {
    key: "paymentClearance",
    label: "Pay",
    type: "select",
    options: [
      { id: "true", name: "Yes" },
      { id: "false", name: "No" }
    ]
  },
  { key: "salesZoneId", label: "Sales Zone", type: "select", options: "salesZones" },
  { key: "packConfigId", label: "Pack Config", type: "select", options: "packConfigs" },
  { key: "customerId",   label: "Customer", type: "select", options: "customers" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority", type: "number" },
  { key: "terminalId", label: "Terminal", type: "select", options: "terminals" },
  { key: "specialRemarks", label: "Remarks" },
];

export default function AdminOrderEditModal({
  open,
  onClose,
  order,
  lookup,
}: Props) {
  // All form state as string | number | null | undefined
  const [form, setForm] = useState<Partial<SalesOrder> & { [key: string]: unknown }>({ ...order });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof SalesOrder, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const patch: Record<string, string | number | boolean | null> = {};

      for (const field of FIELDS) {
        if (field.disabled) continue;
        let v = form[field.key];

        // Always convert these fields to number or null if empty
        if (
          [
            "productId",
            "transporterId",
            "plantCodeId",
            "salesZoneId",
            "packConfigId",
            "terminalId",
            "customerId",
            "priority"
          ].includes(field.key)
        ) {
          v = v === undefined || v === null || v === "" ? null : Number(v);
        }
        // Convert "paymentClearance" to boolean from string
        if (field.key === "paymentClearance") {
          v = v === "true";
        }
        patch[field.key] = v as string | number | boolean | null;
      }

      await axios.patch(API.ADMIN.SALES_ORDER_BY_ID(order.id), patch, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order updated!");
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: { message?: string[] } } } };
      toast.error(
        error?.response?.data?.message?.message?.join
          ? error.response.data.message.message.join(", ")
          : "Failed to update order."
      );
    }
    setLoading(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onClose}
      title="Edit Order"
      description="Edit order details below (Delivery Date cannot be edited)."
    >
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={e => {
          e.preventDefault();
          handleSave();
        }}
      >
        {FIELDS.map(field => {
          if (field.key === "deliveryDate") return null; // Never editable

          let options: OptionItem[] = [];
          if (typeof field.options === "string") {
            options = lookup[field.options] || [];
          } else if (Array.isArray(field.options)) {
            options = field.options;
          }

          return (
            <div key={field.key} className="flex flex-col gap-1">
              <label className="text-sm font-semibold">{field.label}</label>
              {field.type === "select" ? (
                <select
                  value={normalizeInputValue(form[field.key])}
                  disabled={!!field.disabled || loading}
                  onChange={e => handleChange(field.key, e.target.value)}
                  className="border rounded px-2 py-1 text-[15px] bg-white dark:bg-zinc-900"
                >
                  <option value="">Select {field.label}</option>
                  {options.map((opt: OptionItem) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name || opt.code || opt.configName}
                    </option>
                  ))}
                </select>
              ) : field.type === "number" ? (
                <input
                  type="number"
                  value={normalizeInputValue(form[field.key])}
                  onChange={e => handleChange(field.key, e.target.value)}
                  disabled={!!field.disabled || loading}
                  className="border rounded px-2 py-1 text-[15px] bg-white dark:bg-zinc-900"
                />
              ) : (
                <input
                  type="text"
                  value={normalizeInputValue(form[field.key])}
                  onChange={e => handleChange(field.key, e.target.value)}
                  disabled={!!field.disabled || loading}
                  className="border rounded px-2 py-1 text-[15px] bg-white dark:bg-zinc-900"
                />
              )}
            </div>
          );
        })}
        <div className="flex gap-3 mt-2 justify-end col-span-1 md:col-span-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
