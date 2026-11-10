"use client";
import { useEffect, useState } from "react";
import { Box, Chip, CircularProgress, IconButton } from "@mui/material";
import { Archive, Boxes, Eye, Plus, RefreshCw } from "lucide-react";
import { formatDateTimeIST } from "@/common/utils/dateTime";
import type { FreeStockPagination as Pagination, FreeStockUpload } from "../../../types/freeStock";
import { freeStockApi } from "../../../services/freeStock.service";
import FreeStockError from "./FreeStockError";
import FreeStockDialog from "./FreeStockDialog";
import FreeStockDataTable from "./FreeStockDataTable";
import type { FreeStockDataColumn } from "./FreeStockDataTable";
import FreeStockPagination from "./FreeStockPagination";
import FreeStockMetricCard from "./FreeStockMetricCard";
export default function FreeStockUploadHistory({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<FreeStockUpload[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [detail, setDetail] = useState<FreeStockUpload | null>(null);
  const [viewing, setViewing] = useState(false);
  useEffect(() => {
    const controller = new AbortController(); setBusy(true); setError(null);
    void freeStockApi.uploads(page + 1, controller.signal).then((result) => { if (!controller.signal.aborted) { setRows(result.data); setPagination(result.pagination); } }).catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason : new Error("Unable to load upload history.")); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [page]);
  const view = async (id: number) => {
    setViewing(true); setError(null);
    try { setDetail((await freeStockApi.uploadDetail(id)).data); }
    catch (reason) { setError(reason instanceof Error ? reason : new Error("Unable to load upload result.")); }
    finally { setViewing(false); }
  };
  const columns: FreeStockDataColumn<FreeStockUpload>[] = [
    { key: "view", label: "View", render: (row) => <IconButton aria-label={`View upload ${row.id}`} size="small" disabled={viewing} onClick={() => void view(row.id)}><Eye size={17} /></IconButton> },
    { key: "file", label: "File", render: (row) => row.fileName },
    { key: "user", label: "Uploaded By", render: (row) => row.uploadedByName },
    { key: "date", label: "Uploaded On", render: (row) => formatDateTimeIST(row.createdAt) },
    { key: "status", label: "Status", render: (row) => <Chip size="small" label={row.status} color={row.status === "COMPLETED" ? "success" : row.status === "FAILED" ? "error" : "warning"} /> },
    { key: "rows", label: "Rows", render: (row) => row.totalRows },
    { key: "new", label: "New", render: (row) => row.insertedRows },
    { key: "updated", label: "Updated", render: (row) => row.updatedRows },
    { key: "closed", label: "Closed", render: (row) => row.closedRows },
  ];
  return <>
    <FreeStockDialog title="SAP Upload History" onClose={onClose} maxWidth="lg">
      <FreeStockError error={error} />{busy && <CircularProgress size={22} />}
      <FreeStockDataTable columns={columns} rows={rows} rowKey={(row) => row.id} stackBelow="md" emptyText={busy ? "Loading uploads…" : "No uploads yet."} />
      <FreeStockPagination count={pagination?.total ?? 0} page={page} size={10} onPage={setPage} disabled={busy} />
    </FreeStockDialog>
    {detail && <FreeStockDialog title="Upload Result" onClose={() => setDetail(null)}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: 1, mb: 2 }}>
        <FreeStockMetricCard title="Rows" value={detail.totalRows} icon={<Boxes size={18} />} />
        <FreeStockMetricCard title="New" value={detail.insertedRows} icon={<Plus size={18} />} />
        <FreeStockMetricCard title="Updated" value={detail.updatedRows} icon={<RefreshCw size={18} />} />
        <FreeStockMetricCard title="Closed" value={detail.closedRows} icon={<Archive size={18} />} />
      </Box>
      <FreeStockDataTable<{ label: string; value: string }> columns={[
        { key: "field", label: "Field", width: "35%", render: (field) => field.label },
        { key: "value", label: "Value", render: (field) => field.value },
      ]} rows={[
        { label: "File", value: detail.fileName }, { label: "Status", value: detail.status },
        { label: "Uploaded By", value: detail.uploadedByName }, { label: "Uploaded On", value: formatDateTimeIST(detail.createdAt) },
        { label: "Completed On", value: formatDateTimeIST(detail.completedAt) },
      ]} rowKey={(field) => field.label} stackBelow={false} />
      {detail.errorMessage && <FreeStockError error={new Error(detail.errorMessage)} />}
    </FreeStockDialog>}
  </>;
}
