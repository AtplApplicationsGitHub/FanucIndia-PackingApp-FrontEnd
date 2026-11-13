"use client";

import { useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { Boxes, FileSpreadsheet } from "lucide-react";
import CommonButton from "@/common/components/CommonButton";
import type {
  ReservationPreview,
  StockPreview,
  StockRowIssue,
} from "../../../types/freeStock";
import { freeStockApi } from "../../../services/freeStock.service";
import ExcelUploadButton from "../../shared/ExcelUploadButton";
import FreeStockError from "./FreeStockError";
import FreeStockDialog from "./FreeStockDialog";
import FreeStockDataTable from "./FreeStockDataTable";
import type { FreeStockDataColumn } from "./FreeStockDataTable";
import FreeStockMetricCard from "./FreeStockMetricCard";

type Props = {
  mode: "stock" | "reservation";
  onClose: () => void;
  onSuccess: (message: string) => void;
  onChanged: () => void;
};

const HINTS = {
  stock: "Required: .xlsx with the complete current SAP stock list",
  reservation:
    "Required: .xlsx with Storage Bin, Material, Batch and Qty / Req Qty. SO Number is optional",
};

export default function FreeStockUploadDialog({
  mode,
  onClose,
  onSuccess,
  onChanged,
}: Props) {
  const [file, setFile] = useState<File | null>(null);

  const [preview, setPreview] = useState<
    StockPreview | ReservationPreview | null
  >(null);

  const [busy, setBusy] = useState(false);

  const [previewing, setPreviewing] = useState(false);

  const [error, setError] = useState<Error | null>(null);

  const [page, setPage] = useState(0);
  const [issuePage, setIssuePage] = useState(0);

  const stock = mode === "stock";

  const stockPreview = preview && "sample" in preview ? preview : null;

  const reservationPreview = preview && "lines" in preview ? preview : null;

  // Picking or removing a file always clears the previous preview

  const selectFile = (next: File | null) => {
    setFile(next);
    setPreview(null);
    setPage(0);
    setIssuePage(0);
    setError(null);
  };

  const check = async () => {
    if (!file || busy) return;

    setBusy(true);

    setPreviewing(true);

    setError(null);

    setPreview(null);

    setPage(0);
    setIssuePage(0);

    try {
      setPreview(
        stock
          ? (await freeStockApi.previewStock(file)).data
          : (await freeStockApi.previewReservation(file)).data,
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error("Preview failed."));
    } finally {
      setBusy(false);

      setPreviewing(false);
    }
  };

  const commit = async () => {
    if (!file || !preview || busy || (stock && !stockPreview?.canImport))
      return;

    setBusy(true);

    setError(null);

    try {
      const result = stock
        ? await freeStockApi.uploadStock(
            file,
            stockPreview!,
            stockPreview!.skippedRows > 0,
          )
        : await freeStockApi.uploadReservation(file);

      onSuccess(result.message);
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error("Upload failed."));

      setPreview(null);

      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const rows = stockPreview
    ? stockPreview.sample.map((row) => ({ ...row, qty: null, soNumber: null }))
    : (reservationPreview?.lines ?? []);

  const columns: FreeStockDataColumn<(typeof rows)[number]>[] = [
    { key: "bin", label: "Storage Bin", render: (row) => row.storageBin },
    { key: "material", label: "Material", render: (row) => row.materialCode },

    { key: "batch", label: "Batch", render: (row) => row.batch },

    { key: "stock", label: "Stock", render: (row) => row.stockQty },

    ...(!stock
      ? [
          {
            key: "qty",

            label: "Requested Qty",

            render: (row: (typeof rows)[number]) => row.qty,
          },

          {
            key: "so",

            label: "SO Number",

            render: (row: (typeof rows)[number]) => row.soNumber || "—",
          },
        ]
      : []),
  ];

  const issueColumns: FreeStockDataColumn<StockRowIssue>[] = [
    {
      key: "bin",
      label: "Storage Bin",
      render: (row) => row.storageBin || "—",
    },
    {
      key: "material",
      label: "Material Code",
      width: "25%",
      render: (row) => row.materialCode || "—",
    },
    {
      key: "batch",
      label: "Batch",
      render: (row) => row.batch || "—",
    },
    {
      key: "column",
      label: "issue column",
      render: (row) => row.column,
    },
    {
      key: "value",
      label: "invalid value",
      render: (row) => row.value || "—",
    },
  ];

  return (
    <FreeStockDialog
      title={stock ? "Upload Excel" : "Reserve from Excel"}
      onClose={onClose}
      maxWidth="md"
      busy={busy}
      actions={
        <>
          {file && !busy && (
            <CommonButton
              disabled={busy}
              onClick={() => {
                selectFile(null);
              }}
            >
              Back
            </CommonButton>
          )}

          <CommonButton
            disabled={
              !file ||
              busy ||
              Boolean(error) ||
              Boolean(stockPreview && !stockPreview.canImport)
            }
            onClick={() => (preview ? void commit() : void check())}
          >
            {busy
              ? previewing
                ? "Checking..."
                : "Processing..."
              : !preview
                ? stock
                  ? "Review Stock"
                  : "Preview"
                : stock
                  ? stockPreview?.skippedRows
                    ? "Upload valid rows only"
                    : "Import Stock"
                  : "Confirm Reservation"}
          </CommonButton>
        </>
      }
    >
      <Box sx={{ "& .MuiAlert-root": { mt: 0 } }}>
        <FreeStockError error={error} />
      </Box>
      {file && preview ? null : file ? (
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
          onChange={selectFile}
          onError={(message) => setError(new Error(message))}
          disabled={busy}
          dragDropOnly
          hint={HINTS[mode]}
        />
      )}
      {preview && (
        <Box>
          {stockPreview ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                },
                gap: 0.9,
                mb: 0.5,
              }}
            >
              {[
                { label: "Total Records", value: stockPreview.totalRows },
                { label: "New Stock", value: stockPreview.insertedRows },
                { label: "Updated Stock", value: stockPreview.updatedRows },
                { label: "Closed", value: stockPreview.wouldCloseRows },
              ].map(({ label, value }) => (
                <Box
                  key={label}
                  sx={{
                    p: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ display: "block", mb: 0.2 }}
                  >
                    {label}
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {value.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ mb: 2 }}>
              <FreeStockMetricCard
                title="Total Rows"
                value={preview.totalRows.toLocaleString()}
                icon={<Boxes size={18} />}
              />
            </Box>
          )}

          {stockPreview && stockPreview.skippedRows > 0 && (
            <Box sx={{ mb: 0.5 }}>
              <Alert severity="warning" sx={{ mb: 0.5 }}>
                {stockPreview.validRows.toLocaleString()} valid rows can be
                imported; {stockPreview.skippedRows.toLocaleString()} invalid
                rows will be skipped.{" "}
                {stockPreview.protectedRows.toLocaleString()} existing stock
                rows will be preserved because of these issues. No stock has
                been changed yet.
              </Alert>
              {!stockPreview.canImport && (
                <Alert severity="error" sx={{ mb: 0.5 }}>
                  There are no valid rows to import. Go back and correct the
                  file.
                </Alert>
              )}
              <Typography variant="inherit" fontWeight={700} sx={{ mb: 1 }}>
                Invalid Rows
              </Typography>
              <FreeStockDataTable
                compactIssueHeader
                columns={issueColumns}
                rows={stockPreview.issues.slice(
                  issuePage * 5,
                  (issuePage + 1) * 5,
                )}
                rowKey={(row) => row.rowNo}
                maxHeight={320}
                pagination={
                  stockPreview.skippedRows > 5
                    ? {
                        count: stockPreview.skippedRows,
                        page: issuePage,
                        size: 5,
                        onPage: setIssuePage,
                        disabled: busy,
                      }
                    : undefined
                }
              />
            </Box>
          )}
          {!stock && (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.75 }}
              >
                {rows.length.toLocaleString()} reservation rows found.
              </Typography>

              <FreeStockDataTable
                columns={columns}
                rows={rows.slice(page * 50, (page + 1) * 50)}
                rowKey={(row) =>
                  JSON.stringify([row.storageBin, row.materialCode, row.batch])
                }
                maxHeight={260}
                pagination={{
                  count: rows.length,
                  page,
                  size: 50,
                  onPage: setPage,
                  disabled: busy,
                }}
              />
            </>
          )}

          {!stock && (
            <Alert severity="info" sx={{ mt: 0.5 }}>
              Each selected stock row will be locked in full, even when the
              requested quantity is smaller than its stock. Availability is
              checked again when you confirm.
            </Alert>
          )}
        </Box>
      )}
    </FreeStockDialog>
  );
}
