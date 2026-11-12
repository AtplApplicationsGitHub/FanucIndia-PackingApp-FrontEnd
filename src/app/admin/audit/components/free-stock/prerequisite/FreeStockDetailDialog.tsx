"use client";
import { useEffect, useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import type { ChipProps } from "@mui/material";
import { formatDateTimeIST } from "@/common/utils/dateTime";
import { FREE_STOCK_COLUMNS } from "../../../utils/free-stock/freeStockColumns";
import type {
  FreeStockHistory,
  FreeStockPagination as Pagination,
  FreeStockRole,
  FreeStockRow,
} from "../../../types/freeStock";
import { freeStockApi } from "../../../services/freeStock.service";
import { stockCell } from "../../../utils/free-stock/freeStockFormat";
import AuditStatusPill from "../../shared/AuditStatusPill";
import FreeStockError from "./FreeStockError";
import FreeStockDialog from "./FreeStockDialog";
import FreeStockDataTable from "./FreeStockDataTable";
import type { FreeStockDataColumn } from "./FreeStockDataTable";
import FreeStockMetricCard from "./FreeStockMetricCard";
const statusMeta = (
  status: string,
): { label: string; color: ChipProps["color"] } =>
  status === "OPEN"
    ? { label: "Open", color: "success" }
    : status === "RESERVED"
      ? { label: "Reserved", color: "warning" }
      : { label: "Closed", color: "default" };
export default function FreeStockDetailDialog({
  id,
  role,
  onClose,
}: {
  id: number;
  role: FreeStockRole;
  onClose: () => void;
}) {
  const [row, setRow] = useState<FreeStockRow | null>(null);
  const [history, setHistory] = useState<FreeStockHistory[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError(null);
    void Promise.all([
      freeStockApi.detail(id, controller.signal),
      freeStockApi.history(id, page + 1, controller.signal),
    ])
      .then(([detail, result]) => {
        if (!controller.signal.aborted) {
          setRow(detail.data);
          setHistory(result.data);
          setPagination(result.pagination);
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(
            reason instanceof Error
              ? reason
              : new Error("Unable to load stock details."),
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [id, page]);
  const detailValue = (key: keyof FreeStockRow) => {
    const column = FREE_STOCK_COLUMNS.find((item) => item.key === key);
    return row && column ? stockCell(row, column) : "—";
  };
  const historyColumns: FreeStockDataColumn<FreeStockHistory>[] = [
    { key: "name", label: "Name", render: (entry) => entry.reservedByName },
    { key: "zone", label: "Zone", render: (entry) => entry.reservedZoneName },
    {
      key: "qty",
      label: "Qty",
      width: 65,
      render: (entry) => entry.reservedQty,
    },
    {
      key: "so", label: "SO Number",
      render: (entry) => entry.soNumber?.trim()
        ? <Typography component="span" sx={{ fontSize: "inherit", fontWeight: 700 }}>{entry.soNumber}</Typography>
        : "—",
    },
    {
      key: "reservedOn",
      label: "Reserved On",
      width: 210,
      render: (entry) => (
        <Typography
          variant="body2"
          sx={{
            fontSize: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          {formatDateTimeIST(entry.reservedAt)}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (entry) =>
        entry.releasedAt ? "Released" : entry.closedAt ? "Closed" : "Reserved",
    },
    {
      key: "completed",
      label: "Released On",
      width: 210,
      render: (entry) => (
        <Typography
          variant="body2"
          sx={{
            fontSize: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          {formatDateTimeIST(entry.releasedAt ?? entry.closedAt)}
        </Typography>
      ),
    },
    {
      key: "releasedBy",
      label: "Released By",
      render: (entry) => entry.releasedByName || "—",
    },
  ];
  return (
    <FreeStockDialog
      title="Stock Details"
      onClose={onClose}
      maxWidth="lg"
      titleDetails={
        row && (
          <AuditStatusPill
            label={statusMeta(row.status).label}
            color={statusMeta(row.status).color}
          />
        )
      }
    >
      <FreeStockError error={error} />
      {row && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
                lg: "repeat(6, minmax(0, 1fr))",
              },
              gap: 1,
              mb: 1.5,
              "& .MuiPaper-root p:first-of-type": {
                fontSize: 11,
                fontWeight: 700,
                color: "text.primary",
                letterSpacing: "0.04em",
                lineHeight: 1.4,
                mb: 0.25,
              },
              "& .MuiPaper-root p:last-of-type": {
                fontSize: 14,
                fontWeight: 500,
                color: "text.primary",
                lineHeight: 1.4,
              },
              "& .MuiPaper-root p:last-of-type span": {
                fontSize: "inherit",
                fontWeight: "inherit",
              },
            }}
          >
            {[
              {
                title: "Storage Bin",
                value: detailValue("storageBin"),
              },
              {
                title: "Material",
                value: row.materialCode,
              },
              {
                title: "Batch",
                value: row.batch,
              },
              {
                title: "Type",
                value: detailValue("storageType"),
              },
              {
                title: "Plant",
                value: detailValue("plant"),
              },
              {
                title: "Location",
                value: detailValue("storageLocation"),
              },
              {
                title: "Avail",
                value: detailValue("availableQty"),
              },
              {
                title: "GR Number",
                value: detailValue("grNumber"),
              },
              {
                title: "Delivery",
                value: detailValue("delivery"),
              },
              {
                title: "Last Movement",
                value: detailValue("lastMovementDate"),
              },
              {
                title: "Last Changer",
                value: detailValue("lastChanger"),
              },
              {
                title: "SO Number",
                value: row.soNumber || "—",
              },
            ].map((card) => (
              <FreeStockMetricCard
                key={card.title}
                title={card.title}
                value={card.value}
              />
            ))}
          </Box>
          {row.hasShortage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Reserved {row.reservedQty}, current stock {row.stockQty}.
              Shortage: {row.shortageQty}.
            </Alert>
          )}
          <Typography fontWeight={700} sx={{ mb: 1, color: "error.main" }}>
            {role === "ADMIN"
              ? "Reservation History"
              : "My Reservation History"}
          </Typography>
          <Box sx={{ "& thead th": { textTransform: "none" } }}>
          <FreeStockDataTable
            columns={historyColumns}
            rows={history}
            rowKey={(entry) => entry.id}
            stackBelow="md"
            emptyText="No reservation history."
            pagination={{
              count: pagination?.total ?? 0,
              page,
              size: 10,
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
