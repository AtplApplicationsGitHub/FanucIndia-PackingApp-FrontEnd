"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Paper,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { Layers3, Package, Bookmark, CircleAlert } from "lucide-react";
import CommonButton from "@/common/components/CommonButton";
import type {
  BulkReservationPreview,
  BulkReservationResult,
  BulkReservationRow,
  FreeStockRow,
  ReservationLine,
} from "../../../types/freeStock";
import { freeStockApi } from "../../../services/freeStock.service";
import FreeStockError from "./FreeStockError";
import FreeStockDialog from "./FreeStockDialog";
import FreeStockDataTable, {
  type FreeStockDataColumn,
} from "./FreeStockDataTable";

type Props = {
  rows: FreeStockRow[];
  onClose: () => void;
  onSuccess: (message: string) => void;
  onChanged: () => void;
};
const STATUS = {
  ALLOCATED: { label: "Allocated", color: "success" },
  PARTIAL: { label: "Partially allocated", color: "warning" },
  NOT_ALLOCATED: { label: "Not allocated", color: "error" },
} as const;

export default function FreeStockReserveDialog({
  rows,
  onClose,
  onSuccess,
  onChanged,
}: Props) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(rows.map((row) => [row.id, { qty: "", soNumber: "" }])),
  );
  const [preview, setPreview] = useState<BulkReservationPreview | null>(null);
  const [result, setResult] = useState<{
    message: string;
    data: BulkReservationResult;
  } | null>(null);
  const [needsPreview, setNeedsPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  // Requests above current Stock are valid; the backend proposes a partial allocation.
  const valid =
    rows.length > 0 &&
    rows.every(
      (row) =>
        /^\d+(?:\.\d{1,3})?$/.test(values[row.id].qty) &&
        Number(values[row.id].qty) > 0,
    );
  const requestLines = (): ReservationLine[] =>
    rows.map((row) => ({
      storageBin: row.storageBin ?? "",
      materialCode: row.materialCode,
      batch: row.batch,
      qty: values[row.id].qty,
      soNumber: values[row.id].soNumber.trim() || undefined,
    }));
  const close = () => (result ? onSuccess(result.message) : onClose());
  const back = () => {
    setPreview(null);
    setNeedsPreview(false);
    setError(null);
    setPage(0);
  };
  const check = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await freeStockApi.previewSelected(requestLines());
      setPreview(response.data);
      setNeedsPreview(false);
      setPage(0);
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error("Preview failed."));
      setNeedsPreview(true);
    } finally {
      setBusy(false);
    }
  };
  const confirm = async () => {
    if (
      !preview?.canConfirm ||
      !preview.previewToken ||
      needsPreview ||
      result ||
      busy
    )
      return;
    setBusy(true);
    setError(null);
    try {
      const response = await freeStockApi.confirmSelected(
        requestLines(),
        preview.previewToken,
      );
      // Keep the saved results visible. Closing triggers the parent's success/refresh flow.
      setResult(response);
      setPage(0);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason
          : new Error(
              "Reservation failed. Refresh the preview before trying again.",
            ),
      );
      setNeedsPreview(true);
      onChanged();
    } finally {
      setBusy(false);
    }
  };
  const inputSerials = new Map(rows.map((row, index) => [row.id, index + 1]));
  const inputColumns: FreeStockDataColumn<FreeStockRow>[] = [
    { key: "serial", label: "S.No", render: (row) => inputSerials.get(row.id) },
    {
      key: "bin",
      label: "Storage Bin",
      render: (row) => row.storageBin || "—",
    },
    { key: "material", label: "Material", render: (row) => row.materialCode },
    { key: "batch", label: "Batch", render: (row) => row.batch },
    { key: "stock", label: "Stock", render: (row) => row.stockQty },
    {
      key: "qty",
      label: "Requested Qty",
      render: (row) => (
        <TextField
          fullWidth
          size="small"
          value={values[row.id].qty}
          disabled={busy}
          inputProps={{
            "aria-label": `Quantity for ${row.storageBin} ${row.materialCode} ${row.batch}`,
            inputMode: "decimal",
            maxLength: 32,
          }}
          onChange={(event) =>
            setValues((previous) => ({
              ...previous,
              [row.id]: { ...previous[row.id], qty: event.target.value },
            }))
          }
        />
      ),
    },
    {
      key: "so",
      label: "SO Number (optional)",
      render: (row) => (
        <TextField
          fullWidth
          size="small"
          value={values[row.id].soNumber}
          disabled={busy}
          inputProps={{
            "aria-label": `SO Number for ${row.storageBin} ${row.materialCode} ${row.batch}`,
            maxLength: 100,
          }}
          onChange={(event) =>
            setValues((previous) => ({
              ...previous,
              [row.id]: { ...previous[row.id], soNumber: event.target.value },
            }))
          }
        />
      ),
    },
  ];
  const data = result?.data ?? preview;
  const resultSerials = new Map(
    data?.lines.map((row, index) => [row.rowNo, index + 1]) ?? [],
  );
  const requested = Number(data?.summary.requestedQty ?? 0);
  const percentage = (value: string) =>
    requested > 0
      ? Math.min(100, Math.max(0, (Number(value) / requested) * 100))
      : 0;
  const cards = data
    ? [
        {
          key: "rows",
          title: "Selected Rows",
          value: data.totalRows.toLocaleString(),
          unit: "rows",
          Icon: Layers3,
          progress: 100,
        },
        {
          key: "requested",
          title: "Requested Qty",
          value: data.summary.requestedQty,
          unit: "units",
          Icon: Package,
          progress: 100,
        },
        ...(result
          ? [
              {
                key: "reserved",
                title: "Reserved Qty",
                value: data.summary.allocatedQty,
                unit: "units",
                Icon: Bookmark,
                progress: percentage(data.summary.allocatedQty),
              },
            ]
          : []),
        {
          key: "pending",
          title: "Pending Qty",
          value: data.summary.pendingQty,
          unit: "units",
          Icon: CircleAlert,
          progress: percentage(data.summary.pendingQty),
        },
      ]
    : [];
  const resultColumns: FreeStockDataColumn<BulkReservationRow>[] = [
    {
      key: "serial",
      label: "S.No",
      render: (row) => resultSerials.get(row.rowNo),
    },
    { key: "bin", label: "Storage Bin", render: (row) => row.storageBin },
    { key: "material", label: "Material", render: (row) => row.materialCode },
    { key: "batch", label: "Batch", render: (row) => row.batch },
    { key: "stock", label: "Stock", render: (row) => row.stockQty },
    { key: "qty", label: "Requested Qty", render: (row) => row.qty },
    ...(result
      ? [
          {
            key: "allocated",
            label: "Reserved Qty",
            render: (row: BulkReservationRow) => row.allocatedQty,
          },
        ]
      : []),
    { key: "pending", label: "Pending Qty", render: (row) => row.pendingQty },
    { key: "so", label: "SO Number", render: (row) => row.soNumber || "—" },
    {
      key: "status",
      label: "Allocation Status",
      render: (row) => (
        <Chip
          size="small"
          variant="outlined"
          color={STATUS[row.status].color}
          label={STATUS[row.status].label}
        />
      ),
    },
  ];
  return (
    <FreeStockDialog
      title={
        result
          ? "Selected Stock Reservation Result"
          : `Reserve Selected Stock (${rows.length})`
      }
      maxWidth={data ? "xl" : "lg"}
      onClose={close}
      busy={busy}
      actions={
        result ? (
          <CommonButton onClick={close}>Done</CommonButton>
        ) : (
          <>
            {preview && (
              <CommonButton disabled={busy} onClick={back}>
                Back
              </CommonButton>
            )}
            {!preview || needsPreview ? (
              <CommonButton
                disabled={!valid || busy}
                onClick={() => void check()}
              >
                {busy ? "Checking..." : "Preview Allocation"}
              </CommonButton>
            ) : (
              <CommonButton
                disabled={!preview.canConfirm || !preview.previewToken || busy}
                onClick={() => void confirm()}
              >
                {busy ? "Reserving..." : "Confirm Reservation"}
              </CommonButton>
            )}
          </>
        )
      }
    >
      {result && (
        <Alert severity="success" sx={{ mb: 1.5 }}>
          {result.data.reservedRows} stock rows reserved in your name. Pending
          quantities were not reserved.
        </Alert>
      )}
      <FreeStockError error={error} />
      {needsPreview && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Refresh the preview and review current availability before confirming
          again.
        </Alert>
      )}
      {!data ? (
        <FreeStockDataTable
          columns={inputColumns}
          rows={rows}
          rowKey={(row) => row.id}
          maxHeight={420}
        />
      ) : (
        <>
          {!result && !data.canConfirm && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              None of the selected rows can currently be reserved.
            </Alert>
          )}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                md: `repeat(${cards.length}, minmax(0, 1fr))`,
              },
              gap: 1.5,
              mb: 1.2,
            }}
          >
            {cards.map(({ key, title, value, unit, Icon, progress }) => (
              <Paper
                key={key}
                variant="outlined"
                sx={{
                  px: 1.75,
                  py: 1.4,
                  minWidth: 0,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.4,
                  bgcolor: "background.paper",
                  borderColor: "divider",
                  boxShadow: "none",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 1.5,
                    minWidth: 0,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "text.primary",
                        lineHeight: 1,
                        mb: 0.6,
                      }}
                    >
                      {title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 30,
                        fontWeight: 800,
                        lineHeight: 1,
                        color: "text.primary",
                        fontVariantNumeric: "tabular-nums",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {value}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "text.secondary",
                      }}
                    >
                      {unit}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 2,
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                    }}
                  >
                    <Icon size={21} strokeWidth={1.9} />
                  </Box>
                </Box>
                <Box
                  sx={(theme) => ({
                    height: 6,
                    borderRadius: 5,
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    overflow: "hidden",
                  })}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${progress}%`,
                      bgcolor: "primary.main",
                      borderRadius: 5,
                      transition: "width 0.3s ease",
                    }}
                  />
                </Box>
              </Paper>
            ))}
          </Box>
          <FreeStockDataTable
            columns={resultColumns}
            rows={data.lines.slice(page * 50, (page + 1) * 50)}
            rowKey={(row) => row.rowNo}
            stackBelow={false}
            maxHeight={420}
            pagination={{
              count: data.totalRows,
              page,
              size: 50,
              onPage: setPage,
              disabled: busy,
            }}
          />
        </>
      )}
    </FreeStockDialog>
  );
}
