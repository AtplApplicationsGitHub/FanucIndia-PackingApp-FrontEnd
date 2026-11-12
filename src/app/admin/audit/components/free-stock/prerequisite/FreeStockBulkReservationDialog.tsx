"use client";

import { useState } from "react";
import { Alert, Box, Chip, Paper, Typography, alpha } from "@mui/material";
import { Layers3, Package, Bookmark, CircleAlert } from "lucide-react";
import CommonButton from "@/common/components/CommonButton";
import ExcelUploadButton from "../../shared/ExcelUploadButton";
import { freeStockApi } from "../../../services/freeStock.service";
import type { BulkReservationPreview, BulkReservationResult, BulkReservationRow } from "../../../types/freeStock";
import FreeStockDialog from "./FreeStockDialog";
import FreeStockDataTable, { type FreeStockDataColumn } from "./FreeStockDataTable";
import FreeStockError from "./FreeStockError";

const statusMeta = {
  ALLOCATED: { label: "Allocated", color: "success" },
  PARTIAL: { label: "Partially allocated", color: "warning" },
  NOT_ALLOCATED: { label: "Not allocated", color: "error" },
} as const;

export default function FreeStockBulkReservationDialog({ onClose, onChanged }: {
  onClose: () => void;
  onChanged: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<BulkReservationPreview | null>(null);
  const [result, setResult] = useState<BulkReservationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [needsPreview, setNeedsPreview] = useState(false);
  const [page, setPage] = useState(0);
  const data = result ?? preview;

  const reset = () => {
    setFile(null); setPreview(null); setResult(null); setError(null); setPage(0); setNeedsPreview(false);
  };
  const check = async () => {
    if (!file || busy) return;
    setBusy(true); setError(null);
    try {
      const response = await freeStockApi.previewBulk(file);
      setPreview(response.data); setNeedsPreview(false); setPage(0);
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error("Preview failed."));
      setNeedsPreview(true);
    } finally { setBusy(false); }
  };
  const confirm = async () => {
    if (!file || !preview?.canConfirm || needsPreview || busy || result) return;
    setBusy(true); setError(null);
    try {
      const response = await freeStockApi.confirmBulk(file, preview);
      setResult(response.data); setPage(0); onChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error("Confirmation failed. Refresh the preview before trying again."));
      // A lost response may already have committed. Always re-read before another attempt.
      setNeedsPreview(true); onChanged();
    } finally { setBusy(false); }
  };

  const serials = new Map(data?.lines.map((row, index) => [row.rowNo, index + 1]) ?? []);
  const requested = Number(data?.summary.requestedQty ?? 0);
  const percentage = (value: string) => requested > 0 ? Math.min(100, Math.max(0, Number(value) / requested * 100)) : 0;
  const cards = data ? [
    { key: "rows", title: "Total Materials / Batches", value: data.totalRows.toLocaleString(), unit: "rows", Icon: Layers3, progress: 100 },
    { key: "requested", title: "Requested Qty", value: data.summary.requestedQty, unit: "units", Icon: Package, progress: 100 },
    ...(result ? [{ key: "reserved", title: "Reserved Qty", value: data.summary.allocatedQty, unit: "units", Icon: Bookmark, progress: percentage(data.summary.allocatedQty) }] : []),
    { key: "pending", title: "Pending Qty", value: data.summary.pendingQty, unit: "units", Icon: CircleAlert, progress: percentage(data.summary.pendingQty) },
  ] : [];
  const columns: FreeStockDataColumn<BulkReservationRow>[] = [
    { key: "serial", label: "S.No", render: row => serials.get(row.rowNo) },
    { key: "row", label: "Excel Row", render: row => row.rowNo },
    { key: "bin", label: "Storage Bin", render: row => row.storageBin },
    { key: "material", label: "Material", render: row => row.materialCode },
    { key: "batch", label: "Batch", render: row => row.batch },
    { key: "qty", label: "Requested Qty", render: row => row.qty },
    { key: "stock", label: "Stock", render: row => row.stockQty },
    ...(result ? [{ key: "allocated", label: "Reserved Qty", render: (row: BulkReservationRow) => row.allocatedQty }] : []),
    { key: "pending", label: "Pending Qty", render: row => row.pendingQty },
    { key: "so", label: "SO Number", render: row => row.soNumber || "—" },
    { key: "status", label: "Allocation Status", render: row => <Chip size="small" label={statusMeta[row.status].label} color={statusMeta[row.status].color} variant="outlined" /> },
  ];

  return <FreeStockDialog title={result ? "Bulk Reservation Result" : "Bulk Reservation Preview"} onClose={onClose} busy={busy} maxWidth="xl" actions={
    result ? <CommonButton onClick={onClose}>Done</CommonButton> : <>
      {file && <CommonButton disabled={busy} onClick={reset}>Back</CommonButton>}
      {(!preview || needsPreview) ? <CommonButton disabled={!file || busy} onClick={() => void check()}>{busy ? "Checking..." : "Preview Allocation"}</CommonButton>
        : <CommonButton disabled={!preview.canConfirm || busy} onClick={() => void confirm()}>{busy ? "Reserving..." : "Confirm Reservation"}</CommonButton>}
    </>
  }>
    {!data && <ExcelUploadButton file={file} onChange={next => { setFile(next); setPreview(null); setError(null); }} onError={message => setError(new Error(message))} disabled={busy} dragDropOnly hint="Required: .xlsx with Storage Bin, Material, Batch and Qty / Req Qty. SO Number is optional." />}
    <FreeStockError error={error} />
    {needsPreview && <Alert severity="warning" sx={{ mb: 1 }}>Refresh the preview and review availability before confirming again.</Alert>}
    {data && <>
      {result && <Alert severity="success" sx={{ mb: 1.5 }}>
        {result.reservedRows} stock rows reserved in your name. Pending quantities were not reserved.
      </Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(1, minmax(0, 1fr))", sm: "repeat(2, minmax(0, 1fr))", md: `repeat(${cards.length}, minmax(0, 1fr))` }, gap: 1.5, mb: 1.2 }}>
        {cards.map(({ key, title, value, unit, Icon, progress }) => (
          <Paper key={key} variant="outlined" sx={{ px: 1.75, py: 1.4, minWidth: 0, borderRadius: 2, display: "flex", flexDirection: "column", gap: 0.4, bgcolor: "background.paper", borderColor: "divider", boxShadow: "none" }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, minWidth: 0 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: "text.primary", lineHeight: 1, mb: 0.6 }}>{title}</Typography>
                <Typography sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1, color: "text.primary", fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere" }}>{value}</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>{unit}</Typography>
              </Box>
              <Box sx={{ width: 40, height: 40, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
                <Icon size={21} strokeWidth={1.9} />
              </Box>
            </Box>
            <Box sx={(theme) => ({ height: 6, borderRadius: 5, bgcolor: alpha(theme.palette.primary.main, 0.2), overflow: "hidden" })}>
              <Box sx={{ height: "100%", width: `${progress}%`, bgcolor: "primary.main", borderRadius: 5, transition: "width 0.3s ease" }} />
            </Box>
          </Paper>
        ))}
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center", gap: 1, mb: 1.25 }}>
        <Chip size="small" color="success" variant="outlined" label={`Allocated (${data.summary.allocated})`} />
        <Chip size="small" color="warning" variant="outlined" label={`Partial (${data.summary.partial})`} />
        <Chip size="small" color="error" variant="outlined" label={`Not allocated (${data.summary.notAllocated})`} />
      </Box>
      {!result && !data.canConfirm && <Alert severity="warning" sx={{ mb: 1 }}>None of the requested material–batch rows can be reserved.</Alert>}
      <Box sx={{ "& thead th": { textTransform: "none" } }}>
        <FreeStockDataTable columns={columns} rows={data.lines.slice(page * 50, (page + 1) * 50)} rowKey={row => row.rowNo} stackBelow={false} maxHeight={420}
          pagination={{ count: data.totalRows, page, size: 50, onPage: setPage, disabled: busy }} />
      </Box>
    </>}
  </FreeStockDialog>;
}
