"use client";

import { useState } from "react";
import { Alert, Box, Chip, Typography } from "@mui/material";
import { FileSpreadsheet } from "lucide-react";
import CommonButton from "@/common/components/CommonButton";
import ExcelUploadButton from "../../shared/ExcelUploadButton";
import { freeStockApi } from "../../../services/freeStock.service";
import type {
  BulkReservationPreview,
  BulkReservationResult,
  BulkReservationRow,
} from "../../../types/freeStock";
import FreeStockDialog from "./FreeStockDialog";
import FreeStockDataTable, {
  type FreeStockDataColumn,
} from "./FreeStockDataTable";
import FreeStockError from "./FreeStockError";

const statusMeta = {
  ALLOCATED: { label: "Allocated", color: "success" },
  PARTIAL: { label: "Partially allocated", color: "warning" },
  NOT_ALLOCATED: { label: "Not allocated", color: "error" },
} as const;

export default function FreeStockBulkReservationDialog({
  onClose,
  onChanged,
}: {
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
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setPage(0);
    setNeedsPreview(false);
  };

  const check = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);

    try {
      const response = await freeStockApi.previewBulk(file);
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
    if (!file || !preview?.canConfirm || needsPreview || busy || result) return;
    setBusy(true);
    setError(null);

    try {
      const response = await freeStockApi.confirmBulk(file, preview);
      setResult(response.data);
      setPage(0);
      onChanged();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason
          : new Error(
              "Confirmation failed. Refresh the preview before trying again.",
            ),
      );
      // A lost response may already have committed. Always re-read before another attempt.
      setNeedsPreview(true);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const cards = data
    ? [
        {
          key: "rows",
          title: "Total Stock",
          value: data.totalRows.toLocaleString(),
        },
        {
          key: "requested",
          title: "Requested Qty",
          value: data.summary.requestedQty,
        },
        ...(result
          ? [
              {
                key: "reserved",
                title: "Reserved Qty",
                value: data.summary.allocatedQty,
              },
            ]
          : []),
        {
          key: "shortage",
          title: "Pending Qty",
          value: data.summary.pendingQty,
        },
      ]
    : [];

  const columns: FreeStockDataColumn<BulkReservationRow>[] = [
    { key: "bin", label: "Storage Bin", render: (row) => row.storageBin },
    {
      key: "material",
      label: "Material Code",
      render: (row) => row.materialCode,
    },
    { key: "batch", label: "Batch", render: (row) => row.batch },
    { key: "so", label: "SO Number", render: (row) => row.soNumber || "—" },

    { key: "qty", label: "Requested Qty", render: (row) => row.qty },
    { key: "stock", label: "Stock", render: (row) => row.stockQty },
    ...(result
      ? [
          {
            key: "allocated",
            label: "Reserved Qty",
            render: (row: BulkReservationRow) => row.allocatedQty,
          },
        ]
      : []),
    { key: "pending", label: "Shortage Qty", render: (row) => row.pendingQty },
    {
      key: "status",
      label: "Allocation Status",
      render: (row) => (
        <Chip
          size="small"
          label={statusMeta[row.status].label}
          color={statusMeta[row.status].color}
          variant="outlined"
        />
      ),
    },
  ];

  return (
    <FreeStockDialog
      title="Import Reservations"
      onClose={onClose}
      busy={busy}
      maxWidth={data ? "lg" : "md"}
      actions={
        result ? (
          <CommonButton onClick={onClose}>Done</CommonButton>
        ) : (
          <>
            {file && (
              <CommonButton disabled={busy} onClick={reset}>
                Back
              </CommonButton>
            )}
            {!preview || needsPreview ? (
              <CommonButton
                disabled={!file || busy}
                onClick={() => void check()}
              >
                {busy ? "Checking..." : "Preview Allocation"}
              </CommonButton>
            ) : (
              <CommonButton
                disabled={!preview.canConfirm || busy}
                onClick={() => void confirm()}
              >
                {busy ? "Reserving..." : "Confirm Reservation"}
              </CommonButton>
            )}
          </>
        )
      }
    >
      {!data &&
        (file ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <FileSpreadsheet size={18} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {file.name}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {(file.size / 1024).toFixed(1)} KB
              </Typography>
            </Box>
          </Box>
        ) : (
          <ExcelUploadButton
            file={file}
            onChange={(next) => {
              setFile(next);
              setPreview(null);
              setError(null);
            }}
            onError={(message) => setError(new Error(message))}
            disabled={busy}
            dragDropOnly
            hint="Required: .xlsx with Storage Bin, Material, Batch and Qty / Req Qty. SO Number is optional."
          />
        ))}

      <FreeStockError error={error} />

      {data && (
        <>
          {result && (
            <Alert severity="success" sx={{ mb: 1.5 }}>
              {result.reservedRows} stock rows reserved in your name. Pending
              quantities were not reserved.
            </Alert>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                md: `repeat(${cards.length}, minmax(0, 1fr))`,
              },
              gap: 0.9,
              mb: 1.5,
            }}
          >
            {cards.map(({ key, title, value }) => (
              <Box
                key={key}
                sx={{
                  p: 0.75,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "transparent",
                  minWidth: 0,
                }}
              >
                <Typography variant="body2" sx={{ display: "block", mb: 0.2 }}>
                  {title}
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 1,
              mb: 1.25,
            }}
          >
            <Chip
              size="small"
              color="success"
              variant="outlined"
              label={`Allocated (${data.summary.allocated})`}
            />
            <Chip
              size="small"
              color="warning"
              variant="outlined"
              label={`Partial (${data.summary.partial})`}
            />
            <Chip
              size="small"
              color="error"
              variant="outlined"
              label={`Not allocated (${data.summary.notAllocated})`}
            />
          </Box>

          {!result && !data.canConfirm && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              None of the requested material–batch rows can be reserved.
            </Alert>
          )}

          <Box sx={{ "& thead th": { textTransform: "none" } }}>
            <FreeStockDataTable
              columns={columns}
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
          </Box>
        </>
      )}
    </FreeStockDialog>
  );
}
