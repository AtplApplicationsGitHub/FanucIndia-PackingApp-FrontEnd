"use client";

import { useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { FileSpreadsheet } from "lucide-react";
import CommonButton from "@/common/components/CommonButton";
import ExcelUploadButton from "../../shared/ExcelUploadButton";
import { useClearFreeStockPreview } from "../../../hooks/free-stock/useFreeStockPreviewActivity";
import { freeStockApi } from "../../../services/freeStock.service";
import type {
  BulkReservationPreview,
  BulkReservationResult,
} from "../../../types/freeStock";
import FreeStockDialog from "./FreeStockDialog";
import FreeStockReservationTables, {
  ReservationFilterChips,
  type ReservationFilter,
} from "./FreeStockReservationTables";
import FreeStockError from "./FreeStockError";

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
  const [filter, setFilter] = useState<ReservationFilter>("ALL");

  useClearFreeStockPreview(
    !result && !needsPreview ? preview?.previewActivityId : undefined,
  );

  const data = result ?? preview;

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setFilter("ALL");
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
      setFilter("ALL");
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error("Preview failed."));
      setNeedsPreview(true);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    if (!file || !preview?.canConfirm || needsPreview || busy || result) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await freeStockApi.confirmBulk(file, preview);

      setResult(response.data);
      setFilter("ALL");
      onChanged();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason
          : new Error(
              "Confirmation failed. Refresh the preview before trying again.",
            ),
      );

      // A lost response may already have committed.
      // Always re-read before another attempt.
      setNeedsPreview(true);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const actionButtons = result ? (
    <CommonButton onClick={onClose}>Done</CommonButton>
  ) : !preview || needsPreview ? (
    <CommonButton disabled={!file || busy} onClick={() => void check()}>
      {busy ? "Checking..." : "Preview"}
    </CommonButton>
  ) : (
    <CommonButton
      disabled={!preview.canConfirm || busy}
      onClick={() => void confirm()}
    >
      {busy ? "Reserving..." : "Confirm Reservation"}
    </CommonButton>
  );

  return (
    <FreeStockDialog
      title="Import Reservations"
      onClose={onClose}
      busy={busy}
      maxWidth={data ? "xl" : "md"}
      onBack={data && !result ? reset : undefined}
      disableBackdropClose
    >
      <FreeStockError error={error} />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          gap: 1.5,
          mb: 1,
        }}
      >
        {data && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.75,
            }}
          >
            <ReservationFilterChips
              rows={data.lines}
              filter={filter}
              onFilterChange={setFilter}
              disabled={busy}
            />
          </Box>
        )}

        {data && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              ml: "auto",
            }}
          >
            {actionButtons}
          </Box>
        )}
      </Box>

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
            hint="Required: .xlsx with Material, Qty and SO Number."
          />
        ))}
      {!data && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            mt: 1.5,
            mb: 1,
          }}
        >
          {error && file && (
            <CommonButton disabled={busy} onClick={reset}>
              Back
            </CommonButton>
          )}
          <CommonButton
            disabled={!file || busy || Boolean(error)}
            onClick={() => void check()}
          >
            {busy ? "Checking..." : "Preview"}
          </CommonButton>
        </Box>
      )}
      {data && (
        <>
          {result && (
            <Alert severity="success" sx={{ mb: 1.5 }}>
              {result.reservedRows} stock rows reserved in your name. Pending
              quantities were not reserved.
            </Alert>
          )}

          {!result && !data.canConfirm && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              None of the requested material–batch rows can be reserved.
            </Alert>
          )}

          <FreeStockReservationTables
            rows={data.lines}
            filter={filter}
            showReserved
            disabled={busy}
          />
        </>
      )}
    </FreeStockDialog>
  );
}
