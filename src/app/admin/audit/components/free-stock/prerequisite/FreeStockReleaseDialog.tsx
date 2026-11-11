"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";

import CommonButton from "@/common/components/CommonButton";
import type { FreeStockRow } from "../../../types/freeStock";
import { freeStockApi } from "../../../services/freeStock.service";

import FreeStockError from "./FreeStockError";
import FreeStockDialog from "./FreeStockDialog";
import FreeStockDataTable from "./FreeStockDataTable";

const PAGE_SIZE = 5;

export default function FreeStockReleaseDialog({
  rows,
  onClose,
  onSuccess,
  onChanged,
}: {
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
      maxWidth="sm"
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
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontSize: "0.875rem",
          mb: 2,
        }}
      >
        Releasing these reservations will make the stock available for new
        reservations.
      </Typography>
      <FreeStockDataTable<FreeStockRow>
        columns={[
          {
            key: "material",
            label: "Material",
            render: (row) => row.materialCode,
          },
          {
            key: "batch",
            label: "Batch",
            render: (row) => row.batch,
          },
          {
            key: "owner",
            label: "Name",
            render: (row) => row.name || "—",
          },
          {
            key: "qty",
            label: "Reserved Qty",
            render: (row) => row.reservedQty ?? "—",
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

      <FreeStockError error={error} />
    </FreeStockDialog>
  );
}
