"use client";
import { useState } from "react";
import { Typography } from "@mui/material";
import CommonButton from "@/common/components/CommonButton";
import type { FreeStockRow } from "../../../types/freeStock";
import { freeStockApi } from "../../../services/freeStock.service";
import FreeStockError from "./FreeStockError";
import FreeStockDialog from "./FreeStockDialog";
import FreeStockDataTable from "./FreeStockDataTable";
export default function FreeStockReleaseDialog({ rows, onClose, onSuccess, onChanged }: { rows: FreeStockRow[]; onClose: () => void; onSuccess: (message: string) => void; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const submit = async () => {
    if (busy) return;
    setBusy(true); setError(null);
    try { onSuccess((await freeStockApi.release(rows.map((r) => r.id))).message); }
    catch (reason) { setError(reason instanceof Error ? reason : new Error("Release failed.")); onChanged(); }
    finally { setBusy(false); }
  };
  return <FreeStockDialog title={rows.length === 1 ? "Release Reservation" : `Release ${rows.length} Reservations`} maxWidth="sm" onClose={onClose} busy={busy} actions={<CommonButton disabled={busy} onClick={() => void submit()} sx={{ color: "error.main" }}>{busy ? "Releasing…" : "Release"}</CommonButton>}>
    <Typography variant="body2" sx={{ mb: 2 }}>The selected stock will become OPEN and available for reservation again.</Typography>
    <FreeStockDataTable<FreeStockRow> columns={[
      { key: "material", label: "Material", render: (row) => row.materialCode },
      { key: "batch", label: "Batch", render: (row) => row.batch },
      { key: "owner", label: "Name", render: (row) => row.name || "—" },
      { key: "qty", label: "Reserved Qty", render: (row) => row.reservedQty ?? "—" },
    ]} rows={rows} rowKey={(row) => row.id} maxHeight={300} />
    <FreeStockError error={error} />
  </FreeStockDialog>;
}
