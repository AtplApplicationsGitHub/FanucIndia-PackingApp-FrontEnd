"use client";
import { useState } from "react";
import { Alert, TextField } from "@mui/material";
import CommonButton from "@/common/components/CommonButton";
import type { FreeStockRow } from "../../../types/freeStock";
import { freeStockApi } from "../../../services/freeStock.service";
import FreeStockError from "./FreeStockError";
import FreeStockDialog from "./FreeStockDialog";
import FreeStockDataTable from "./FreeStockDataTable";
import type { FreeStockDataColumn } from "./FreeStockDataTable";
export default function FreeStockReserveDialog({ rows, onClose, onSuccess, onChanged }: { rows: FreeStockRow[]; onClose: () => void; onSuccess: (message: string) => void; onChanged: () => void }) {
  const [values, setValues] = useState(() => Object.fromEntries(rows.map((row) => [row.id, { qty: "", soNumber: "" }])));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const valid = rows.length > 0 && rows.every((row) => /^\d+(?:\.\d{1,3})?$/.test(values[row.id].qty) && Number(values[row.id].qty) > 0);
  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true); setError(null);
    try {
      const result = await freeStockApi.reserve(rows.map((row) => ({ materialCode: row.materialCode, batch: row.batch, qty: values[row.id].qty, soNumber: values[row.id].soNumber.trim() || undefined })));
      onSuccess(result.message);
    } catch (reason) { setError(reason instanceof Error ? reason : new Error("Reservation failed.")); onChanged(); }
    finally { setBusy(false); }
  };
  const columns: FreeStockDataColumn<FreeStockRow>[] = [
    { key: "material", label: "Material", render: (row) => row.materialCode },
    { key: "batch", label: "Batch", render: (row) => row.batch },
    { key: "stock", label: "Stock", render: (row) => row.stockQty },
    { key: "qty", label: "Requested Qty", render: (row) => <TextField fullWidth size="small" value={values[row.id].qty} disabled={busy} inputProps={{ "aria-label": `Quantity for ${row.materialCode} ${row.batch}`, inputMode: "decimal", maxLength: 32 }} onChange={(event) => setValues((prev) => ({ ...prev, [row.id]: { ...prev[row.id], qty: event.target.value } }))} /> },
    { key: "so", label: "SO Number (optional)", render: (row) => <TextField fullWidth size="small" value={values[row.id].soNumber} disabled={busy} inputProps={{ "aria-label": `SO Number for ${row.materialCode} ${row.batch}`, maxLength: 100 }} onChange={(event) => setValues((prev) => ({ ...prev, [row.id]: { ...prev[row.id], soNumber: event.target.value } }))} /> },
  ];
  return <FreeStockDialog title={`Reserve Selected Stock (${rows.length})`} onClose={onClose} busy={busy} actions={<CommonButton disabled={!valid || busy} onClick={() => void submit()}>{busy ? "Reserving…" : "Confirm Reservation"}</CommonButton>}>
    <Alert severity="info" sx={{ mb: 2 }}>Reservations use your logged-in name and zone. The whole stock row is locked. If any row is unavailable, nothing is reserved.</Alert>
    <FreeStockError error={error} /><FreeStockDataTable columns={columns} rows={rows} rowKey={(row) => row.id} maxHeight={420} />
  </FreeStockDialog>;
}
