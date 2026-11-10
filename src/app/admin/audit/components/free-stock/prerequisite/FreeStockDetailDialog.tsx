"use client";
import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { Clock3, LockKeyhole, PackageOpen, TriangleAlert } from "lucide-react";
import CommonButton from "@/common/components/CommonButton";
import { formatDateTimeIST } from "@/common/utils/dateTime";
import { FREE_STOCK_COLUMNS } from "../../../utils/free-stock/freeStockColumns";
import type { FreeStockHistory, FreeStockPagination as Pagination, FreeStockRole, FreeStockRow } from "../../../types/freeStock";
import { freeStockApi } from "../../../services/freeStock.service";
import { stockCell } from "../../../utils/free-stock/freeStockFormat";
import FreeStockStatusChip from "./FreeStockStatusChip";
import FreeStockError from "./FreeStockError";
import FreeStockDialog from "./FreeStockDialog";
import FreeStockDataTable from "./FreeStockDataTable";
import type { FreeStockDataColumn } from "./FreeStockDataTable";
import FreeStockPagination from "./FreeStockPagination";
import FreeStockMetricCard from "./FreeStockMetricCard";
export default function FreeStockDetailDialog({ id, role, onClose, onRelease }: { id: number; role: FreeStockRole; onClose: () => void; onRelease: (row: FreeStockRow) => void }) {
  const [row, setRow] = useState<FreeStockRow | null>(null);
  const [history, setHistory] = useState<FreeStockHistory[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const controller = new AbortController(); setBusy(true); setError(null);
    void Promise.all([freeStockApi.detail(id, controller.signal), freeStockApi.history(id, page + 1, controller.signal)]).then(([detail, result]) => {
      if (!controller.signal.aborted) { setRow(detail.data); setHistory(result.data); setPagination(result.pagination); }
    }).catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason : new Error("Unable to load stock details.")); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [id, page]);
  const fields = (start: number, end?: number) => row ? FREE_STOCK_COLUMNS.slice(start, end).map((column) => ({ label: column.label, value: stockCell(row, column) })) : [];
  const fieldColumns: FreeStockDataColumn<{ label: string; value: string }>[] = [
    { key: "field", label: "Field", width: "45%", render: (field) => <Box component="span" sx={{ fontWeight: 600 }}>{field.label}</Box> },
    { key: "value", label: "Value", width: "55%", render: (field) => field.value },
  ];
  const historyColumns: FreeStockDataColumn<FreeStockHistory>[] = [
    { key: "name", label: "Name", render: (entry) => entry.reservedByName },
    { key: "zone", label: "Zone", render: (entry) => entry.reservedZoneName },
    { key: "qty", label: "Qty", render: (entry) => entry.reservedQty },
    { key: "so", label: "SO Number", render: (entry) => entry.soNumber || "—" },
    { key: "reserved", label: "Reserved On", render: (entry) => formatDateTimeIST(entry.reservedAt) },
    { key: "status", label: "Status", render: (entry) => entry.releasedAt ? "Released" : entry.closedAt ? "Closed" : "Reserved" },
    { key: "completed", label: "Released / Closed On", render: (entry) => formatDateTimeIST(entry.releasedAt ?? entry.closedAt) },
    { key: "releasedBy", label: "Released By", render: (entry) => entry.releasedByName || "—" },
  ];
  return <FreeStockDialog title="Stock Details" titleDetails={row ? <><Typography component="span" variant="body2" fontWeight={600} sx={{ overflowWrap: "anywhere", minWidth: 0 }}>{row.materialCode} · {row.batch}</Typography><FreeStockStatusChip status={row.status} /></> : undefined} onClose={onClose} maxWidth="lg" actions={row?.canRelease ? <CommonButton disabled={busy || Boolean(error)} sx={{ color: "error.main" }} onClick={() => onRelease(row)}>Release Reservation</CommonButton> : undefined}>
    <FreeStockError error={error} />{busy && <CircularProgress size={24} />}
    {row && <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: 1, mb: 2 }}>
        <FreeStockMetricCard title="Stock" value={row.stockQty} icon={<PackageOpen size={18} />} />
        <FreeStockMetricCard title="Reserved Qty" value={row.reservedQty ?? "—"} icon={<LockKeyhole size={18} />} />
        <FreeStockMetricCard title="Shortage Qty" value={row.shortageQty ?? "—"} icon={<TriangleAlert size={18} />} />
        <FreeStockMetricCard title="Reserved Days" value={row.reservedDays ?? "—"} icon={<Clock3 size={18} />} />
      </Box>
      {row.hasShortage && <Alert severity="error" sx={{ mb: 2 }}>Reserved {row.reservedQty}, current stock {row.stockQty}. Shortage: {row.shortageQty}.</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }, gap: 2, mb: 2 }}>
        <Box sx={{ minWidth: 0 }}><Typography fontWeight={700} sx={{ mb: 1 }}>Stock Information</Typography><FreeStockDataTable columns={fieldColumns} rows={fields(0, 14)} rowKey={(field) => field.label} stackBelow={false} /></Box>
        <Box sx={{ minWidth: 0 }}><Typography fontWeight={700} sx={{ mb: 1 }}>Reservation Information</Typography><FreeStockDataTable columns={fieldColumns} rows={[{ label: "Status", value: row.status }, ...fields(14)]} rowKey={(field) => field.label} stackBelow={false} /></Box>
      </Box>
      <Typography fontWeight={700} sx={{ mb: 1 }}>{role === "ADMIN" ? "Reservation History" : "My Reservation History"}</Typography>
      <FreeStockDataTable columns={historyColumns} rows={history} rowKey={(entry) => entry.id} stackBelow="md" emptyText="No reservation history." />
      <FreeStockPagination count={pagination?.total ?? 0} page={page} size={10} onPage={setPage} disabled={busy} />
    </>}
  </FreeStockDialog>;
}
