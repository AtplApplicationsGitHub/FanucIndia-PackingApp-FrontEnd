"use client";

import { useEffect, useState } from "react";
import { Box, Paper } from "@mui/material";

import type { FreeStockRole, FreeStockRow } from "../../../types/freeStock";

import {
  downloadReservationTemplate,
  exportStock,
} from "../../../utils/free-stock/freeStockExport";

import { useFreeStock } from "../../../hooks/free-stock/useFreeStock";
import { showGlobalMessage } from "../../../utils/auditEvents";

import FreeStockTable from "./FreeStockTable";
import FreeStockStatusCards from "./FreeStockStatusCards";
import FreeStockToolbar from "./FreeStockToolbar";
import FreeStockDetailDialog from "./FreeStockDetailDialog";
import FreeStockUploadDialog from "./FreeStockUploadDialog";
import FreeStockBulkReservationDialog from "./FreeStockBulkReservationDialog";
import FreeStockReserveDialog from "./FreeStockReserveDialog";
import FreeStockReleaseDialog from "./FreeStockReleaseDialog";
import FreeStockUploadHistory from "./FreeStockUploadHistory";
import FreeStockError from "./FreeStockError";

export default function FreeStockAdminScreen({
  role = "ADMIN",
}: {
  role?: FreeStockRole;
}) {
  const stock = useFreeStock();
  const { data, filters, refresh, statusSummary, myReservations } = stock;
  const [selected, setSelected] = useState<number[]>([]);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [upload, setUpload] = useState<"stock" | "reservation" | null>(null);
  const [reserveRows, setReserveRows] = useState<FreeStockRow[] | null>(null);
  const [releaseRows, setReleaseRows] = useState<FreeStockRow[] | null>(null);
  const [history, setHistory] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);

  const admin = role === "ADMIN";
  const rows = data?.data ?? [];
  const selectedRows = rows.filter((row) => selected.includes(row.id));
  const pending = stock.loading || stock.search !== filters.search;

  useEffect(() => {
    setSelected([]);
  }, [filters, data]);

  const success = (message: string) => {
    setUpload(null);
    setReserveRows(null);
    setReleaseRows(null);
    setSelected([]);
    setActionError(null);
    showGlobalMessage(message, "success");
    refresh();
  };

  const download = async (template: boolean) => {
    if (downloading) return;

    setDownloading(true);
    setActionError(null);

    try {
      if (template) {
        await downloadReservationTemplate();
      } else {
        await exportStock(filters);
      }
    } catch (reason) {
      setActionError(
        reason instanceof Error ? reason : new Error("Download failed."),
      );
    } finally {
      setDownloading(false);
    }
  };

  const release = (row: FreeStockRow) => {
    setDetailId(null);
    setReleaseRows([row]);
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 2,
        width: "100%",
        minWidth: 0,
      }}
    >
      <FreeStockStatusCards
        status={stock.status}
        summary={statusSummary}
        onChange={stock.changeStatus}
        admin={admin}
        mine={stock.mine}
        myReservations={myReservations}
        onMineChange={stock.changeMine}
      />

      <Box
        sx={{
          mt: 1,
          width: "100%",
          minWidth: 0,
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <FreeStockToolbar
            admin={admin}
            search={stock.search}
            onSearch={stock.setSearch}
            zoneId={stock.zoneId}
            zones={stock.zones}
            onZoneChange={stock.changeZone}
            reservedDays={stock.reservedDays}
            onReservedDaysChange={stock.changeReservedDays}
            onClearFilters={stock.clearReservationFilters}
            selectedCount={selected.length}
            selectedRows={selectedRows}
            pending={pending}
            downloading={downloading}
            hasData={Boolean(data)}
            onDownload={download}
            onUpload={setUpload}
            onReserve={setReserveRows}
            onRelease={setReleaseRows}
            onHistory={setHistory}
          />
        </Box>

        {(stock.error || actionError) && (
          <Box sx={{ px: 2 }}>
            <FreeStockError error={stock.error} />
            <FreeStockError error={actionError} />
          </Box>
        )}

        <FreeStockTable
          rows={rows}
          total={data?.pagination.total ?? 0}
          page={stock.page}
          size={stock.size}
          loading={pending}
          selected={selected}
          onSelect={setSelected}
          onPage={stock.setPage}
          onSize={stock.changeSize}
          onView={setDetailId}
          onRelease={release}
        />
      </Box>

      {detailId !== null && (
        <FreeStockDetailDialog
          id={detailId}
          role={role}
          onClose={() => setDetailId(null)}
        />
      )}

      {upload === "reservation" && (
        <FreeStockBulkReservationDialog
          onClose={() => setUpload(null)}
          onChanged={refresh}
        />
      )}
      {upload === "stock" && (
        <FreeStockUploadDialog
          mode={upload}
          onClose={() => setUpload(null)}
          onSuccess={success}
          onChanged={refresh}
        />
      )}

      {reserveRows && (
        <FreeStockReserveDialog
          rows={reserveRows}
          onClose={() => setReserveRows(null)}
          onSuccess={success}
          onChanged={refresh}
        />
      )}

      {releaseRows && (
        <FreeStockReleaseDialog
          rows={releaseRows}
          onClose={() => setReleaseRows(null)}
          onSuccess={success}
          onChanged={refresh}
        />
      )}

      {history && <FreeStockUploadHistory onClose={() => setHistory(false)} />}
    </Box>
  );
}
