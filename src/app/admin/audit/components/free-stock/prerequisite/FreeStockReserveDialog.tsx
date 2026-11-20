"use client";

import { useState } from "react";
import { Alert, Box, Snackbar, TextField } from "@mui/material";

import CommonButton from "@/common/components/CommonButton";

import type {
  BulkReservationPreview,
  BulkReservationResult,
  FreeStockRow,
  ReservationLine,
} from "../../../types/freeStock";

import { freeStockApi } from "../../../services/freeStock.service";
import FreeStockDialog from "./FreeStockDialog";

import FreeStockDataTable, {
  type FreeStockDataColumn,
} from "./FreeStockDataTable";

import FreeStockReservationTables, {
  ReservationFilterChips,
  type ReservationFilter,
} from "./FreeStockReservationTables";

type Props = {
  rows: FreeStockRow[];
  onClose: () => void;
  onSuccess: (message: string) => void;
  onChanged: () => void;
};

type SnackbarSeverity = "success" | "error" | "warning";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
  id: number;
};

export default function FreeStockReserveDialog({
  rows,
  onClose,
  onSuccess,
  onChanged,
}: Props) {
  // Store Requested Qty and SO Number for each selected row.
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

  const [filter, setFilter] = useState<ReservationFilter>("ALL");

  // Snackbar notifications.
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
    id: 0,
  });

  const showSnackbar = (
    message: string,
    severity: SnackbarSeverity = "success",
  ) => {
    setSnackbar((previous) => ({
      open: true,
      message,
      severity,
      id: previous.id + 1,
    }));
  };

  const closeSnackbar = () => {
    setSnackbar((previous) => ({
      ...previous,
      open: false,
    }));
  };

  // Validate Requested Qty and SO Number.
  // Requested Qty must be a positive whole number.
  // Backend handles partial allocation when Qty exceeds stock.
  const valid =
    rows.length > 0 &&
    rows.every(
      (row) =>
        /^\d+$/.test(values[row.id].qty) &&
        Number(values[row.id].qty) > 0 &&
        values[row.id].soNumber.trim().length > 0 &&
        values[row.id].soNumber.trim().length <= 100,
    );

  // Prepare the manual reservation API payload.
  const requestLines = (): ReservationLine[] =>
    rows.map((row) => ({
      materialCode: row.materialCode,
      qty: values[row.id].qty,
      soNumber: values[row.id].soNumber.trim(),
    }));

  const close = () => {
    closeSnackbar();

    if (result) {
      onClose();
      return;
    }

    onClose();
  };
  // Return from allocation preview to input table.
  const back = () => {
    setPreview(null);
    setNeedsPreview(false);
    setFilter("ALL");
  };

  // Preview selected stock without saving reservations.
  const check = async () => {
    if (!valid || busy) return;

    setBusy(true);

    try {
      const response = await freeStockApi.previewSelected(requestLines());

      // Store API preview to display batch-wise allocation.
      setPreview(response.data);

      if (!response.data.canConfirm) {
        showSnackbar(
          "None of the selected rows can currently be reserved.",
          "warning",
        );
      }

      setNeedsPreview(false);
      setFilter("ALL");
    } catch (reason) {
      const err =
        reason instanceof Error ? reason : new Error("Preview failed.");

      showSnackbar(err.message, "error");
      setNeedsPreview(true);
    } finally {
      setBusy(false);
    }
  };

  // Confirm selected stock reservation.
  const confirm = async () => {
    if (
      !preview?.canConfirm ||
      !preview.previewToken ||
      needsPreview ||
      result ||
      busy
    ) {
      return;
    }

    setBusy(true);

    try {
      const response = await freeStockApi.confirmSelected(
        requestLines(),
        preview.previewToken,
      );

      // Keep the confirmed result visible until Done.
      setResult(response);
      setFilter("ALL");

      showSnackbar(
        `Successfully reserved ${response.data.reservedRows} stock ${
          response.data.reservedRows === 1 ? "row" : "rows"
        }. Any pending quantities remain unreserved.`,
      );
    } catch (reason) {
      const err =
        reason instanceof Error
          ? reason
          : new Error(
              "Reservation failed. Refresh the preview before trying again.",
            );

      showSnackbar(err.message, "error");

      setNeedsPreview(true);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  // Columns for initial manual reservation entry.
  const inputColumns: FreeStockDataColumn<FreeStockRow>[] = [
    {
      key: "material",
      label: "Material",
      width: "19%",
      render: (row) => row.materialCode,
    },
    {
      key: "stock",
      label: "Stock",
      width: "7%",
      render: (row) => row.stockQty,
    },
    {
      key: "qty",
      label: "Requested Qty",
      width: "12%",
      render: (row) => (
        <TextField
          variant="standard"
          fullWidth
          size="small"
          value={values[row.id].qty}
          disabled={busy}
          inputProps={{
            "aria-label": `Quantity for ${row.materialCode}`,
            inputMode: "numeric",
            maxLength: 2,
          }}
          sx={{
            "& .MuiInputBase-root": {
              fontSize: "0.8rem",
            },
            "& .MuiInputBase-input": {
              py: 0.5,
              px: 0.5,
            },
          }}
          onChange={(event) => {
            const value = event.target.value;

            // Prevent alphabets, decimals and special characters.
            if (!/^\d*$/.test(value)) return;

            setValues((previous) => ({
              ...previous,
              [row.id]: {
                ...previous[row.id],
                qty: value,
              },
            }));
          }}
        />
      ),
    },
    {
      key: "so",
      label: "SO Number",
      width: "20%",
      render: (row) => (
        <TextField
          variant="standard"
          fullWidth
          size="small"
          value={values[row.id].soNumber}
          disabled={busy}
          inputProps={{
            "aria-label": `SO Number for ${row.materialCode}`,
            maxLength: 10,
          }}
          sx={{
            "& .MuiInputBase-root": {
              fontSize: "0.8rem",
            },
            "& .MuiInputBase-input": {
              py: 0.5,
              px: 0.5,
            },
          }}
          onChange={(event) =>
            setValues((previous) => ({
              ...previous,
              [row.id]: {
                ...previous[row.id],
                soNumber: event.target.value,
              },
            }))
          }
        />
      ),
    },
  ];

  // Display preview data or confirmed reservation data.
  const data = result?.data ?? preview;

  return (
    <>
      <FreeStockDialog
        title={
          result
            ? "Selected Stock Reservation Result"
            : "Reserve Selected Stock"
        }
        // Show selected-row count only before preview.
        titleDetails={
          !data ? (
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 24,
                height: 24,
                px: 0.5,
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {rows.length}
            </Box>
          ) : undefined
        }
        // Small input popup and XL allocation preview.
        maxWidth={data ? "xl" : "sm"}
        // Back arrow in header only during preview.
        onBack={preview && !result ? back : undefined}
        onClose={close}
        busy={busy}
        // Preview button stays in footer of initial screen.
        actions={
          result ? null : !preview || needsPreview ? (
            <CommonButton
              disabled={!valid || busy}
              onClick={() => void check()}
            >
              {busy ? "Checking..." : "Preview"}
            </CommonButton>
          ) : null
        }
      >
        {!data ? (
          // Initial manual reservation table.
          <Box
            sx={{
              "& .MuiTableCell-head": {
                py: "4px !important",
                px: "8px !important",
                height: "30px !important",
                fontSize: "0.75rem",
                textTransform: "none !important",
              },
              "& .MuiTableCell-body": {
                py: "4px !important",
                px: "8px !important",
                fontSize: "0.8rem",
              },
            }}
          >
            <FreeStockDataTable
              columns={inputColumns}
              rows={rows}
              rowKey={(row) => row.id}
              maxHeight={420}
            />
          </Box>
        ) : (
          <>
            {/* Allocation badges and action button in same row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1.5,
                mb: 1.5,
              }}
            >
              {/* Left: Allocation filter badges */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 0.75,
                  minWidth: 0,
                }}
              >
                <ReservationFilterChips
                  rows={data.lines}
                  filter={filter}
                  onFilterChange={setFilter}
                  disabled={busy}
                />
              </Box>

              {/* Right: Confirm Reservation or Done */}
              {result ? (
                <CommonButton onClick={close}>Done</CommonButton>
              ) : (
                preview &&
                !needsPreview && (
                  <CommonButton
                    disabled={
                      !preview.canConfirm || !preview.previewToken || busy
                    }
                    onClick={() => void confirm()}
                  >
                    {busy ? "Reserving..." : "Confirm Reservation"}
                  </CommonButton>
                )
              )}
            </Box>

            {/* Same split batch-wise allocation table as Excel */}
            <FreeStockReservationTables
              rows={data.lines}
              filter={filter}
              showReserved
              disabled={busy}
            />
          </>
        )}
      </FreeStockDialog>

      {/* DispatchView-style toast notification */}
      <Snackbar
        key={snackbar.id}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 10,
        }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
