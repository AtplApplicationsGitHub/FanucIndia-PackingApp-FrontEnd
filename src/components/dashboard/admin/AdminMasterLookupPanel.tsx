"use client";

import React, { useState, useEffect, Fragment } from "react";
import LookupCrudTable, {
  LookupRow,
} from "@/components/dashboard/admin/LookupCrudTable";
import { Combobox } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { authFetch } from "@/lib/authFetch";

// Map UI types to kebab-case API paths
const TYPE_TO_API_PATH: Record<string, string> = {
  products: "products",
  transporters: "transporters",
  plantCodes: "plant-codes",
  salesZones: "sales-zones",
  packConfigs: "pack-configs",
  terminals: "terminals",
  customers: "customers",
  printers: "printers",
};

const MASTER_LOOKUP_OPTIONS = [
  { label: "Products", key: "products" },
  { label: "Transporter", key: "transporters" },
  { label: "Delivery Plant Code", key: "plantCodes" },
  { label: "Sales Zone", key: "salesZones" },
  { label: "Packing Configuration", key: "packConfigs" },
  { label: "Terminals", key: "terminals" },
  { label: "Customers", key: "customers" },
  { label: "Printers", key: "printers" },
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://fanuc.goval.app:3010";

export default function AdminMasterLookupPanel() {
  const [selectedType, setSelectedType] = useState<string>(
    MASTER_LOOKUP_OPTIONS[0].key
  );
  const [data, setData] = useState<LookupRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [adding, setAdding] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [addObj, setAddObj] = useState<Partial<LookupRow>>({});
  const [editObj, setEditObj] = useState<Partial<LookupRow>>({});

  // Helper to get kebab-case API path
  const getApiPath = () => TYPE_TO_API_PATH[selectedType] || selectedType;

  // --- Fetch / Refresh ---
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const apiPath = getApiPath();
      const res = await authFetch(`${API_BASE_URL}/lookup/${apiPath}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const json = (await res.json()) as LookupRow[];
      setData(json);
    } catch {
      setError("Failed to load lookup data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAdding(false);
    setEditingId(null);
    setAddObj({});
    setEditObj({});
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  // --- Handlers ---
  const handleAdd = () => {
    setAdding(true);
    setEditingId(null);
    setAddObj({});
  };

  const handleAddChange = (
    key: string,
    value: string | number | boolean | null | undefined
  ) => setAddObj((prev) => ({ ...prev, [key]: value }));

  const handleEdit = (id: number, row: LookupRow) => {
    setEditingId(id);
    setEditObj(row);
  };

  const handleEditChange = (
    key: string,
    value: string | number | boolean | null | undefined
  ) => setEditObj((prev) => ({ ...prev, [key]: value }));

  const handleCancel = () => {
    setAdding(false);
    setEditingId(null);
    setAddObj({});
    setEditObj({});
  };

  const handleSave = async (type: string, id: number) => {
    setLoading(true);
    try {
      const apiPath = getApiPath();
      if (id === -1) {
        // CREATE
        const res = await authFetch(`${API_BASE_URL}/lookup/${apiPath}`, {
          method: "POST",
          body: JSON.stringify(addObj),
        });
        if (!res.ok) throw await res.json();
      } else {
        // UPDATE
        const res = await authFetch(`${API_BASE_URL}/lookup/${apiPath}/${id}`, {
          method: "PUT",
          body: JSON.stringify(editObj),
        });
        if (!res.ok) throw await res.json();
      }
      handleCancel();
      await fetchData();
    } catch (err: unknown) {
      let errorMsg =
        "Failed to save. Ensure all required fields are filled as strings.";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        errorMsg = (err as { message: string }).message;
      }

      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm("Delete this lookup value?")) return;
    setLoading(true);
    try {
      const apiPath = getApiPath();
      const res = await authFetch(`${API_BASE_URL}/lookup/${apiPath}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`${res.status}`);
      await fetchData();
    } catch {
      setError("Failed to delete.");
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    <div className="w-full flex flex-col items-center mt-8">
      {/* Lookup type combobox row */}
      <div className="flex items-center gap-4 w-full max-w-xl mb-1">
        <label className="text-[16px] font-semibold min-w-[110px]">
          Lookup Type
        </label>
        <Combobox
          value={selectedType}
          onChange={(value) =>
            setSelectedType(value ?? MASTER_LOOKUP_OPTIONS[0].key)
          }
        >
          <div className="relative w-full">
            <Combobox.Button as={Fragment}>
              <div className="relative w-full">
                <Combobox.Input
                  className="w-full bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-md px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  displayValue={(key: string) =>
                    MASTER_LOOKUP_OPTIONS.find((o) => o.key === key)?.label ||
                    ""
                  }
                  readOnly
                  placeholder="Select lookup type"
                />
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  size={20}
                />
              </div>
            </Combobox.Button>
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-zinc-900 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-white">
              {MASTER_LOOKUP_OPTIONS.map((option) => (
                <Combobox.Option
                  key={option.key}
                  value={option.key}
                  className={({ active }) =>
                    `cursor-pointer select-none relative py-2 pl-4 pr-4 ${
                      active ? "bg-[#3b579d] text-white" : "text-gray-200"
                    }`
                  }
                >
                  {option.label}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </div>
        </Combobox>
      </div>

      {/* Table or loading/error */}
      <div className="w-full mt-8 max-w-3xl">
        {loading ? (
          <div className="text-center py-10 text-lg">Loading...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-600">{error}</div>
        ) : (
          <LookupCrudTable
            type={selectedType}
            data={data}
            editingId={editingId}
            editObj={editObj}
            onEdit={handleEdit}
            onEditChange={handleEditChange}
            onSave={handleSave}
            onRequestDelete={handleDelete}
            onCancel={handleCancel}
            addObj={addObj}
            onAdd={handleAdd}
            onAddChange={handleAddChange}
            adding={adding}
            refresh={fetchData}
          />
        )}
      </div>
    </div>
  );
}
