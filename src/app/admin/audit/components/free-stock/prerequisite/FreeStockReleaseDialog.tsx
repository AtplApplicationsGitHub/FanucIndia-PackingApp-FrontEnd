"use client";

import { useState } from "react";
import { Box } from "@mui/material";

import CommonButton from "@/common/components/CommonButton";
import { freeStockApi } from "../../../services/freeStock.service";

import FreeStockError from "./FreeStockError";
import FreeStockDialog from "./FreeStockDialog";
import FreeStockDataTable from "./FreeStockDataTable";
import { formatDateIST } from "@/common/utils/dateTime";
import type { FreeStockRole, FreeStockRow } from "../../../types/freeStock";
const PAGE_SIZE = 5;

export default function FreeStockReleaseDialog({
  role,
  rows,
  onClose,
  onSuccess,
  onChanged,
}: {
  role: FreeStockRole;
  rows: FreeStockRow[];
  onClose: () => void;
  onSuccess: (message: string) => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);

  const submit = async () => {
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      const result = await freeStockApi.release(rows.map((row) => row.id));

      onSuccess(result.message);
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error("Release failed."));
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <FreeStockDialog
      title="Release Reservation"
      titleDetails={
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            minWidth: 24,
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {rows.length}
        </Box>
      }
      maxWidth="md"
      onClose={onClose}
      busy={busy}
      actions={
        <CommonButton
          disabled={busy || rows.length === 0}
          onClick={() => void submit()}
        >
          {busy ? "Releasing…" : "Release"}
        </CommonButton>
      }
    >
      <Box
        sx={{
          "& .MuiTableCell-head": {
            fontSize: "0.72rem !important",
            fontWeight: 600,
            textTransform: "none !important",
            whiteSpace: "nowrap",
            py: "3px !important",
            px: "8px !important",
            height: "26px !important",
            lineHeight: 1.2,
          },
          "& .MuiTableCell-body": {
            fontSize: "0.8rem !important",
            fontWeight: 400,
            py: "8px !important",
            px: "8px !important",
          },
        }}
      >
        <FreeStockDataTable<FreeStockRow>
          columns={[
            {
              key: "material",
              label: "Material",
              render: (row) => row.materialCode,
            },
            {
              key: "soNumber",
              label: "SO Number",
              width: "18%",
              render: (row) => row.soNumber || "—",
            },
            {
              key: "batch",
              label: "Batch",
              render: (row) => row.batch,
            },
            ...(role === "ADMIN"
              ? [
                  {
                    key: "owner",
                    label: "Name",
                    render: (row: FreeStockRow) => row.name || "—",
                  },
                ]
              : []),
            {
              key: "qty",
              label: "Reserved Qty",
              width: "12%",
              render: (row) => row.reservedQty ?? "—",
            },
            {
              key: "reservedDate",
              label: "Reserved Date / Days",
              width: "35%",
              render: (row) =>
                row.reservedDate
                  ? `${formatDateIST(row.reservedDate)}${
                      row.reservedDays != null
                        ? ` (${row.reservedDays} ${row.reservedDays === 1 ? "day" : "days"})`
                        : ""
                    }`
                  : "—",
            },
          ]}
          rows={rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}
          rowKey={(row) => row.id}
          maxHeight={300}
          pagination={
            rows.length > PAGE_SIZE
              ? {
                  count: rows.length,
                  page,
                  size: PAGE_SIZE,
                  onPage: setPage,
                  disabled: busy,
                }
              : undefined
          }
        />
      </Box>

      <FreeStockError error={error} />
    </FreeStockDialog>
  );
}
