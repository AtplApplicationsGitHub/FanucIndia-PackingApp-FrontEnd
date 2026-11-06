"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Alert,
  Box,
  IconButton,
  InputBase,
  Paper,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Download, Upload, Search, X } from "lucide-react";
import CommonButton from "@/common/components/CommonButton";
import type { FreeStockRow } from "../types/freeStock";
import {
  FREE_STOCK_MOCK_LAST_UPLOAD,
  INITIAL_FREE_STOCK_ROWS,
} from "./freeStockMock";
import FreeStockDetailDialog from "./FreeStockDetailDialog";
import FreeStockTable from "./FreeStockTable";

export default function FreeStockAdminScreen() {
  const theme = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<FreeStockRow[]>(() =>
    INITIAL_FREE_STOCK_ROWS.map((row) => ({ ...row })),
  );
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<"view" | "release" | null>(null);
  const [message, setMessage] = useState("");

  const selectedRow = rows.find((row) => row.id === selectedId) ?? null;
  const filteredRows = useMemo(() => {
    const search = query.trim().toLowerCase();
    return rows.filter(
      (row) =>
        !search ||
        [row.Material, row.Batch, row["GR Number"], row.heldBy].some((value) =>
          String(value).toLowerCase().includes(search),
        ),
    );
  }, [query, rows]);
  const currentPage = Math.min(
    page,
    Math.max(0, Math.ceil(filteredRows.length / rowsPerPage) - 1),
  );
  const visibleRows = filteredRows.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage,
  );
  const metrics = useMemo(() => {
    const open = rows.filter((row) => row.status === "Open");
    const held = rows.filter((row) => Boolean(row.heldBy));
    const users = new Set(held.map((row) => row.heldBy));
    return [
      {
        label: "Line items",
        value: rows.length,
        note: `${open.length} open · ${rows.length - open.length} closed`,
      },
      {
        label: "Total stock",
        value: open.reduce((sum, row) => sum + Number(row.Stock || 0), 0),
        note: "open lines only",
      },
      {
        label: "Held qty",
        value: held.reduce((sum, row) => sum + row.heldQty, 0),
        note: `${users.size} users holding`,
      },
      { label: "Held lines", value: held.length, note: "currently locked" },
      {
        label: "Held over 7 days",
        value: held.filter((row) => (row.daysHeld ?? 0) > 7).length,
        note: "needs release",
        critical: true,
      },
    ];
  }, [rows]);

  const openDialog = (id: string, mode: "view" | "release") => {
    setSelectedId(id);
    setDialogMode(mode);
  };
  const closeDialog = () => {
    setDialogMode(null);
    setSelectedId(null);
  };
  const releaseHold = () => {
    if (!selectedId) return;
    setRows((prev) =>
      prev.map((row) =>
        row.id === selectedId
          ? { ...row, heldBy: "", heldQty: 0, daysHeld: null }
          : row,
      ),
    );
    closeDialog();
    setMessage("Hold released (mock data only)");
  };
  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Mock-only phase: never parse, upload, or save the selected Excel file.
    setMessage(`${file.name} selected. Mock mode: Excel is not imported.`);
    event.target.value = "";
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 2.5 },
        py: 2,
        width: "100%",
        maxWidth: 1500,
        mx: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          mb: 1.75,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Free stock
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last upload: {FREE_STOCK_MOCK_LAST_UPLOAD}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <CommonButton
            startIcon={<Download size={16} />}
            onClick={() =>
              setMessage("Mock mode: Excel download is not connected.")
            }
          >
            Download Excel
          </CommonButton>
          <CommonButton
            startIcon={<Upload size={16} />}
            onClick={() => fileRef.current?.click()}
            sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
          >
            Upload Excel
          </CommonButton>
          <input
            ref={fileRef}
            hidden
            type="file"
            accept=".xlsx,.xls"
            onChange={selectFile}
            aria-label="Select free stock Excel"
          />
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: 1.5,
          mb: 2,
        }}
      >
        {metrics.map((metric) => (
          <Paper
            key={metric.label}
            variant="outlined"
            sx={{
              p: 1.75,
              borderRadius: 2,
              bgcolor:
                metric.critical && metric.value > 0
                  ? theme.palette.mode === "dark"
                    ? "#4A1B1B"
                    : "#FDE3E3"
                  : "background.paper",
              borderColor:
                metric.critical && metric.value > 0 ? "transparent" : "divider",
            }}
          >
            <Typography
              variant="caption"
              color={
                metric.critical && metric.value > 0
                  ? theme.palette.mode === "dark"
                    ? "#FF9B9B"
                    : "#A11A1A"
                  : "text.secondary"
              }
            >
              {metric.label}
            </Typography>
            <Typography
              fontSize={26}
              fontWeight={600}
              lineHeight={1.3}
              color={
                metric.critical && metric.value > 0
                  ? theme.palette.mode === "dark"
                    ? "#FF9B9B"
                    : "#A11A1A"
                  : "text.primary"
              }
            >
              {metric.value.toLocaleString()}
            </Typography>
            <Typography
              variant="caption"
              color={
                metric.critical && metric.value > 0
                  ? theme.palette.mode === "dark"
                    ? "#FF9B9B"
                    : "#A11A1A"
                  : "text.secondary"
              }
            >
              {metric.note}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: 270 },
              height: 40,
              border: 1,
              borderColor: "divider",
              borderRadius: "4px",
              bgcolor: "background.paper",
            }}
          >
            <InputBase
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Search material, batch, GR number, user"
              inputProps={{ "aria-label": "Search free stock" }}
              sx={{ ml: 1, flex: 1, fontSize: 14 }}
            />
            {query ? (
              <IconButton
                size="small"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setPage(0);
                }}
              >
                <X size={18} />
              </IconButton>
            ) : (
              <Box sx={{ px: 1 }}>
                <Search size={18} />
              </Box>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {filteredRows.length.toLocaleString()} rows
          </Typography>
        </Box>
        <FreeStockTable
          rows={visibleRows}
          total={filteredRows.length}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(size) => {
            setRowsPerPage(size);
            setPage(0);
          }}
          onView={(id) => openDialog(id, "view")}
          onRelease={(id) => openDialog(id, "release")}
        />
      </Paper>
      <FreeStockDetailDialog
        row={selectedRow}
        mode={dialogMode}
        onClose={closeDialog}
        onRequestRelease={() => setDialogMode("release")}
        onConfirmRelease={releaseHold}
      />
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={2800}
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="info"
          onClose={() => setMessage("")}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
