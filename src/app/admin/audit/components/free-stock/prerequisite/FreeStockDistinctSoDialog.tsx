"use client";

import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import { freeStockApi } from "../../../services/freeStock.service";
import type {
  FreeStockDistinctSoRow,
  FreeStockPagination,
  FreeStockRole,
} from "../../../types/freeStock";

import FreeStockDialog from "./FreeStockDialog";
import FreeStockDataTable from "./FreeStockDataTable";
import FreeStockError from "./FreeStockError";

const PAGE_SIZE = 10;

type Props = {
  role: FreeStockRole;
  onClose: () => void;
};

export default function FreeStockDistinctSoDialog({ role, onClose }: Props) {
  const [rows, setRows] = useState<FreeStockDistinctSoRow[]>([]);
  const [pagination, setPagination] = useState<FreeStockPagination | null>(
    null,
  );

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    void freeStockApi
      .distinctSo(
        {
          page: page + 1,
          limit: PAGE_SIZE,
        },
        controller.signal,
      )
      .then((result) => {
        if (controller.signal.aborted) return;

        setRows(result.data);
        setPagination(result.pagination);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;

        setRows([]);
        setPagination(null);

        setError(
          reason instanceof Error
            ? reason
            : new Error("Unable to load distinct SO Numbers."),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [page]);

  return (
    <FreeStockDialog
      title={role === "ADMIN" ? "SO Numbers" : "My SO Numbers"}
      maxWidth="xs"
      onClose={onClose}
    >
      <Box
        sx={{
          "& .MuiTableCell-head": {
            fontSize: "0.72rem !important",
            fontWeight: 600,
            textTransform: "none !important",
            whiteSpace: "nowrap",
            textAlign: "center !important",
            py: "3px !important",
            px: "8px !important",
            height: "26px !important",
            lineHeight: 1.2,
          },

          "& .MuiTableCell-body": {
            fontSize: "0.8rem !important",
            fontWeight: 400,
            textAlign: "center !important",
            py: "8px !important",
            px: "8px !important",
          },
        }}
      >
        <FreeStockDataTable<FreeStockDistinctSoRow>
          columns={[
            {
              key: "soNumber",
              label: "SO Number",
              render: (row) => row.soNumber,
            },
          ]}
          rows={rows}
          rowKey={(row) => row.soNumber}
          emptyText={
            loading
              ? "Loading..."
              : error
                ? "Unable to load SO Numbers."
                : "No SO Numbers found."
          }
          maxHeight={350}
          pagination={
            pagination
              ? {
                  count: pagination.total,
                  page,
                  size: PAGE_SIZE,
                  onPage: setPage,
                  disabled: loading,
                }
              : undefined
          }
        />
      </Box>

      <FreeStockError error={error} />
    </FreeStockDialog>
  );
}
