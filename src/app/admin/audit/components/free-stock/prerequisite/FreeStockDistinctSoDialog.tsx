"use client";

import { useEffect, useState } from "react";
import { Box, IconButton, InputAdornment, Link, TextField } from "@mui/material";
import { Search, X } from "lucide-react";
import { secureDownload } from "@/common/lib/secure-download";
import { formatDateTimeIST } from "@/common/utils/dateTime";
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

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
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
          search,
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
  }, [page, search]);
  const [downloadingSo, setDownloadingSo] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<Error | null>(null);

  const applySearch = (value: string) => {
    setSearch(value.trim());
    setPage(0);
  };

  const handleDownload = async (soNumber: string) => {
    if (downloadingSo) return;
    setDownloadingSo(soNumber);
    setDownloadError(null);
    try {
      const blob = await freeStockApi.exportSo(soNumber);
      secureDownload(blob, `SO_${soNumber}.xlsx`);
    } catch (reason) {
      setDownloadError(
        reason instanceof Error
          ? reason
          : new Error("Unable to download SO Excel."),
      );
    } finally {
      setDownloadingSo(null);
    }
  };

  return (
    <FreeStockDialog
      title={role === "ADMIN" ? "SO Numbers" : "My SO Numbers"}
      maxWidth="sm"
      onClose={onClose}
    >
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          applySearch(searchInput);
        }}
        sx={{ mb: 1.5, mx: "auto", width: { xs: "100%", sm: 260 } }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search SO Number"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          slotProps={{
            htmlInput: { "aria-label": "Search SO Number", maxLength: 255 },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  {searchInput && (
                    <IconButton
                      type="button"
                      size="small"
                      aria-label="Clear SO search"
                      onClick={() => {
                        setSearchInput("");
                        applySearch("");
                      }}
                    >
                      <X size={16} />
                    </IconButton>
                  )}
                  <IconButton type="submit" size="small" aria-label="Search SO numbers">
                    <Search size={18} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <Box
        aria-busy={loading}
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
              width: "28%",
              render: (row) => (
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => void handleDownload(row.soNumber)}
                  disabled={Boolean(downloadingSo)}
                  aria-label={`Download Excel for SO ${row.soNumber}`}
                  sx={{
                    fontWeight: 600,
                    cursor: "pointer",
                    "&:disabled": {
                      color: "text.disabled",
                      cursor: "progress",
                      textDecoration: "none",
                    },
                  }}
                >
                  {row.soNumber}
                </Link>
              ),
            },
            {
              key: "requestedBy",
              label: "Requested By",
              width: "34%",
              render: (row) => row.requestedBy ?? "—",
            },
            {
              key: "requestedAt",
              label: "Requested At",
              width: "38%",
              render: (row) => formatDateTimeIST(row.requestedAt),
            },
          ]}
          rows={rows}
          rowKey={(row) => row.soNumber}
          emptyText={
            loading
              ? ""
              : error
                ? "Unable to load SO Numbers."
                : search
                  ? "No SO Numbers match your search."
                  : "No SO Numbers found."
          }
          maxHeight={350}
          pagination={
            pagination
              ? {
                  count: pagination.total,
                  page: pagination.page - 1,
                  size: PAGE_SIZE,
                  onPage: setPage,
                  disabled: loading,
                }
              : undefined
          }
        />
      </Box>

      <FreeStockError error={error ?? downloadError} />
    </FreeStockDialog>
  );
}
