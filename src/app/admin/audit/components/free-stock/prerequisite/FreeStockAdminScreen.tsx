"use client";

import { useEffect, useState } from "react";
import { Box, Paper } from "@mui/material";

import type { FreeStockRole, FreeStockRow } from "../../../types/freeStock";

import {
  downloadReservationTemplate,
  exportStock,
} from "../../../utils/free-stock/freeStockExport";
import FreeStockDistinctSoDialog from "./FreeStockDistinctSoDialog";
import { freeStockApi } from "../../../services/freeStock.service";
import { useFreeStock } from "../../../hooks/free-stock/useFreeStock";
import { showGlobalMessage } from "../../../utils/auditEvents";

import FreeStockTable from "./FreeStockTable";
import FreeStockGroupedTable from "./FreeStockGroupedTable";
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
  const [distinctSoOpen, setDistinctSoOpen] = useState(false);
  const [distinctSoCount, setDistinctSoCount] = useState<number | null>(null);
  const [distinctSoError, setDistinctSoError] = useState<Error | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);

  const admin = role === "ADMIN";
  // Reserved tab comes grouped by SO; every other tab is a flat list.
  const rows: FreeStockRow[] = !data
    ? []
    : data.groupedBy === "SO_NUMBER"
      ? data.data.flatMap((group) => group.items)
      : data.data;
  const selectedRows = rows.filter((row) => selected.includes(row.id));
  const pending = stock.loading;

  useEffect(() => {
    setSelected([]);
  }, [filters, data]);

  useEffect(() => {
    const controller = new AbortController();

    void freeStockApi
      .distinctSo({ page: 1, limit: 1 }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;

        setDistinctSoCount(result.distinctSoCount);
        setDistinctSoError(null);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;

        setDistinctSoCount(null);
        setDistinctSoError(
          reason instanceof Error
            ? reason
            : new Error("Unable to load Distinct SO Count."),
        );
      });

    return () => controller.abort();
  }, [data]);

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
        distinctSoCount={distinctSoCount}
        onDistinctSoClick={() => setDistinctSoOpen(true)}
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
            search={stock.searchInput}
            onSearch={stock.setSearchInput}
            onSubmitSearch={stock.submitSearch}
            onClearSearch={stock.clearSearch}
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

        {(stock.error || actionError || distinctSoError) && (
          <Box sx={{ px: 2 }}>
            <FreeStockError error={stock.error} />
            <FreeStockError error={actionError} />
            <FreeStockError error={distinctSoError} />
          </Box>
        )}

        {data?.groupedBy === "SO_NUMBER" ? (
          <FreeStockGroupedTable
            role={role}
            groups={data.data}
            total={data.pagination.total}
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
        ) : (
          <FreeStockTable
            rows={rows}
            role={role}
            onStockChanged={refresh}
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
        )}
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
          role={role}
          rows={releaseRows}
          onClose={() => setReleaseRows(null)}
          onSuccess={success}
          onChanged={refresh}
        />
      )}

      {history && <FreeStockUploadHistory onClose={() => setHistory(false)} />}

      {distinctSoOpen && (
        <FreeStockDistinctSoDialog
          role={role}
          onClose={() => setDistinctSoOpen(false)}
        />
      )}
    </Box>
  );
}
