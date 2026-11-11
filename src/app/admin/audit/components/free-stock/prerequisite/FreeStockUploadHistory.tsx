"use client";
import { useEffect, useState } from "react";
import { Chip, Typography } from "@mui/material";
import { formatDateTimeIST } from "@/common/utils/dateTime";
import type {
  FreeStockPagination as Pagination,
  FreeStockUpload,
} from "../../../types/freeStock";
import { freeStockApi } from "../../../services/freeStock.service";
import FreeStockError from "./FreeStockError";
import FreeStockDialog from "./FreeStockDialog";
import FreeStockDataTable from "./FreeStockDataTable";
import type { FreeStockDataColumn } from "./FreeStockDataTable";
import FreeStockMetricCard from "./FreeStockMetricCard";
export default function FreeStockUploadHistory({
  onClose,
}: {
  onClose: () => void;
}) {
  const [rows, setRows] = useState<FreeStockUpload[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError(null);
    void freeStockApi
      .uploads(page + 1, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setRows(result.data);
          setPagination(result.pagination);
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(
            reason instanceof Error
              ? reason
              : new Error("Unable to load upload history."),
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [page]);

  const columns: FreeStockDataColumn<FreeStockUpload>[] = [
    {
      key: "user",
      label: "Uploaded By",
      width: "16%",
      render: (row) => row.uploadedByName,
    },
    {
      key: "date",
      label: "Uploaded On",
      width: "20%",
      render: (row) => (
        <Typography
          variant="body2"
          sx={{ fontSize: "inherit", whiteSpace: "nowrap" }}
        >
          {formatDateTimeIST(row.createdAt)}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "18%",
      render: (row) => (
        <Chip
          size="small"
          label={row.status}
          color={
            row.status === "COMPLETED"
              ? "success"
              : row.status === "FAILED"
                ? "error"
                : "warning"
          }
        />
      ),
    },
    {
      key: "rows",
      label: "Rows",
      width: "11%",
      render: (row) => row.totalRows,
    },
    {
      key: "new",
      label: "New",
      width: "11%",
      render: (row) => row.insertedRows,
    },
    {
      key: "updated",
      label: "Updated",
      width: "12%",
      render: (row) => row.updatedRows,
    },
    {
      key: "closed",
      label: "Closed",
      width: "12%",
      render: (row) => row.closedRows,
    },
  ];
  return (
    <>
      <FreeStockDialog
        title="SAP Upload History"
        onClose={onClose}
        maxWidth="lg"
      >
        <FreeStockError error={error} />
        <FreeStockDataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          stackBelow="md"
          emptyText={busy ? "Loading uploads…" : "No uploads yet."}
          pagination={{
            count: pagination?.total ?? 0,
            page,
            size: 10,
            onPage: setPage,
            disabled: busy,
          }}
        />
      </FreeStockDialog>
    </>
  );
}
