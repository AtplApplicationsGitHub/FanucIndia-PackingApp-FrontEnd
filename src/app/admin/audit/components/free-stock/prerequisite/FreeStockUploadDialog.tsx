"use client";
import { useState } from "react";
import { Alert, Box, Checkbox, CircularProgress, FormControlLabel, Paper, Stack, Typography } from "@mui/material";
import { Archive, Boxes, Plus, RefreshCw } from "lucide-react";
import CommonButton from "@/common/components/CommonButton";
import type { ReservationPreview, StockPreview } from "../../../types/freeStock";
import { freeStockApi } from "../../../services/freeStock.service";
import FreeStockError from "./FreeStockError";
import FreeStockDialog from "./FreeStockDialog";
import FreeStockDataTable from "./FreeStockDataTable";
import type { FreeStockDataColumn } from "./FreeStockDataTable";
import FreeStockPagination from "./FreeStockPagination";
import FreeStockMetricCard from "./FreeStockMetricCard";
type Props = { mode: "stock" | "reservation"; onClose: () => void; onSuccess: (message: string) => void; onChanged: () => void };
export default function FreeStockUploadDialog({ mode, onClose, onSuccess, onChanged }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<StockPreview | ReservationPreview | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const stock = mode === "stock";
  const stockPreview = preview && "sample" in preview ? preview : null;
  const reservationPreview = preview && "lines" in preview ? preview : null;
  const check = async () => {
    if (!file || busy) return;
    setBusy(true); setError(null); setPreview(null); setConfirmed(false); setPage(0);
    try { setPreview(stock ? (await freeStockApi.previewStock(file)).data : (await freeStockApi.previewReservation(file)).data); }
    catch (reason) { setError(reason instanceof Error ? reason : new Error("Preview failed.")); }
    finally { setBusy(false); }
  };
  const commit = async () => {
    if (!file || !preview || busy || (stock && !confirmed)) return;
    setBusy(true); setError(null);
    try {
      const result = stock ? await freeStockApi.uploadStock(file) : await freeStockApi.uploadReservation(file);
      onSuccess(result.message);
    } catch (reason) { setError(reason instanceof Error ? reason : new Error("Upload failed.")); setPreview(null); setConfirmed(false); onChanged(); }
    finally { setBusy(false); }
  };
  const rows = stockPreview ? stockPreview.sample.map((row) => ({ ...row, qty: null, soNumber: null })) : reservationPreview?.lines ?? [];
  const columns: FreeStockDataColumn<(typeof rows)[number]>[] = [
    { key: "material", label: "Material", render: (row) => row.materialCode },
    { key: "batch", label: "Batch", render: (row) => row.batch },
    { key: "stock", label: "Stock", render: (row) => row.stockQty },
    ...(!stock ? [
      { key: "qty", label: "Requested Qty", render: (row: (typeof rows)[number]) => row.qty },
      { key: "so", label: "SO Number", render: (row: (typeof rows)[number]) => row.soNumber || "—" },
    ] : []),
  ];
  return <FreeStockDialog title={stock ? "Upload SAP Stock" : "Reserve from Excel"} onClose={onClose} busy={busy} actions={<CommonButton disabled={!preview || busy || (stock && !confirmed)} onClick={() => void commit()}>{busy ? "Processing…" : stock ? "Import Stock" : "Confirm Reservation"}</CommonButton>}>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{stock ? "Upload the complete current SAP stock list from Sheet1, columns A–N." : "Upload Material, Batch and Qty / Req Qty. SO Number is optional. Every row must be available for the reservation to succeed."}</Typography>
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 1 }}><Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      <CommonButton component="label" disabled={busy}>Choose Excel<input hidden type="file" accept=".xlsx" onChange={(event) => {
        const next = event.target.files?.[0] ?? null; event.target.value = "";
        setPreview(null); setConfirmed(false); setPage(0); setError(null);
        if (next && !next.name.toLowerCase().endsWith(".xlsx")) { setFile(null); setError(new Error("Please choose an .xlsx file.")); return; }
        setFile(next);
      }} /></CommonButton>
      {file && <Typography variant="body2" sx={{ overflowWrap: "anywhere", minWidth: 0, flex: 1 }}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</Typography>}
      <CommonButton disabled={!file || busy} onClick={() => void check()}>{busy ? <CircularProgress size={18} /> : "Preview"}</CommonButton>
    </Stack></Paper>
    <FreeStockError error={error} />
    {preview && <Box sx={{ mt: 2 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: stock ? "repeat(4, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))" }, gap: 1, mb: 2 }}>
        <FreeStockMetricCard title="Total Rows" value={preview.totalRows.toLocaleString()} icon={<Boxes size={18} />} />
        {stockPreview && <><FreeStockMetricCard title="New" value={stockPreview.insertedRows} icon={<Plus size={18} />} /><FreeStockMetricCard title="Updated" value={stockPreview.updatedRows} icon={<RefreshCw size={18} />} /><FreeStockMetricCard title="Will Close" value={stockPreview.wouldCloseRows} icon={<Archive size={18} />} /></>}
      </Box>
      {stock && <Alert severity="warning" sx={{ mb: 2 }}>Stock missing from this file will become CLOSED. Existing reservations remain attached to those closed records.</Alert>}
      <FreeStockDataTable columns={columns} rows={rows.slice(page * 50, (page + 1) * 50)} rowKey={(row) => JSON.stringify([row.materialCode, row.batch])} maxHeight={300} />
      {stockPreview ? <Typography variant="caption" color="text.secondary">Showing the first {stockPreview.sample.length} rows. All {stockPreview.totalRows.toLocaleString()} rows will be imported.</Typography> : <FreeStockPagination count={rows.length} page={page} size={50} onPage={setPage} disabled={busy} />}
      {stock && <FormControlLabel sx={{ mt: 1, ml: 0, alignItems: "flex-start" }} control={<Checkbox checked={confirmed} disabled={busy} onChange={(_, checked) => setConfirmed(checked)} />} label="This file contains the complete current SAP stock list." />}
      {!stock && <Alert severity="info" sx={{ mt: 1 }}>Each selected stock row will be locked in full, even when the requested quantity is smaller than its stock. Availability is checked again when you confirm.</Alert>}
    </Box>}
  </FreeStockDialog>;
}
