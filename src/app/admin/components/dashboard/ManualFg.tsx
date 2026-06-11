"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import {
  alpha,
  CircularProgress,
  IconButton,
  InputBase,
  Link as MuiLink,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Link from "next/link";
import { Download } from "lucide-react";
import {
  downloadManualFgLocationExcel,
  ManualFgStorageRow,
  useManualFgStorageList,
} from "@/app/admin/components/hooks/useManualFg";
import { formatDateTimeIST, getISTDateKey } from "@/common/utils/dateTime";
import CloseIcon from "@mui/icons-material/Close";

function formatDate(iso: string) {
  if (!iso || iso === "-") return "-";
  return formatDateTimeIST(iso);
}

function matchesSalesOrder(row: ManualFgStorageRow, search: string) {
  const term = search.trim().toLowerCase();
  if (!term) return true;

  return row.salesOrderNumber.toLowerCase().includes(term);
}

function matchesDate(row: ManualFgStorageRow, selectedDateKey: string) {
  if (!selectedDateKey) return true;
  return getISTDateKey(row.dateTime) === selectedDateKey;
}

export default function FgLocation() {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [fromDate, setFromDate] = React.useState<Date | null>(new Date());
  const [toDate, setToDate] = React.useState<Date | null>(new Date());
  const [downloadingExcel, setDownloadingExcel] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  const fromDateKey = React.useMemo(() => getISTDateKey(fromDate), [fromDate]);
  const toDateKey = React.useMemo(() => getISTDateKey(toDate), [toDate]);

  const { rows, loading, error } = useManualFgStorageList({
    fromDate: fromDateKey || undefined,
    toDate: toDateKey || undefined,
    salesOrderNumber: search || undefined,
  });

  React.useEffect(() => {
    setPage(0);
  }, [search, fromDateKey, toDateKey]);

  const filteredRows = React.useMemo(
    () => rows.filter((row) => matchesSalesOrder(row, search)),
    [rows, search],
  );

  const visibleRows = React.useMemo(
    () =>
      filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage],
  );

  const applySearch = () => {
    setSearch(searchInput.trim().replace(/\s+/g, " "));
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  const handleDownloadExcel = async () => {
    setDownloadError(null);
    setDownloadingExcel(true);

    try {
      await downloadManualFgLocationExcel({
        fromDate: fromDateKey || undefined,
        toDate: toDateKey || undefined,
        salesOrderNumber: search || undefined,
      });
    } catch (err) {
      console.error("Failed to download manual FG location Excel", err);
      setDownloadError(
        err instanceof Error
          ? err.message
          : "Failed to download manual FG location Excel",
      );
    } finally {
      setDownloadingExcel(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        pt: 0,
        pb: 4,
        px: { xs: 1, sm: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          mb: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            bgcolor: "background.paper",
            width: { xs: "100%", md: "auto" },
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: { xs: "stretch", lg: "center" },
            gap: 2,
            px: { xs: 1.5, sm: 2, md: 3 },
            py: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: { xs: "wrap", sm: "nowrap" },
              gap: 1.25,
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              width: "100%",
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", lg: "auto" },
                flex: { lg: "0 1 260px" },
                minWidth: { lg: 220 },
                maxWidth: { lg: 280 },
              }}
            >
              <Box
                component="form"
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  applySearch();
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  minWidth: 0,
                  p: "2px 4px",
                  border: 1,
                  borderColor: (t) =>
                    t.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.23)"
                      : "#e0e0e0",
                  borderRadius: "4px",
                  height: 40,
                  bgcolor: "background.paper",
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1, fontSize: "13px" }}
                  placeholder="Search"
                  inputProps={{ "aria-label": "search manual fg storage" }}
                  value={searchInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchInput(value);
                    if (value === "") setSearch("");
                  }}
                />
                {searchInput && (
                  <IconButton
                    sx={{ p: "5px" }}
                    aria-label="clear"
                    onClick={handleClearSearch}
                  >
                    <ClearIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
                <IconButton type="submit" sx={{ p: "5px" }} aria-label="search">
                  <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>

            <DatePicker
              label="FROM DATE"
              value={fromDate ? dayjs(fromDate) : null}
              onChange={(value) => {
                setFromDate(value?.isValid() ? value.toDate() : null);
              }}
              format="DD-MM-YYYY"
              slotProps={{
                field: {
                  clearable: true,
                  onClear: () => {
                    setFromDate(null);
                    setPage(0);
                  },
                },
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: {
                    width: { xs: "100%", sm: 170, md: 180, lg: 190 },
                    flex: "0 0 auto",
                    "& .MuiInputBase-root": { height: 40, fontSize: "13px" },
                    "& .MuiInputLabel-root": { fontSize: "12px" },
                  },
                },
              }}
            />

            <DatePicker
              label="TO DATE"
              value={toDate ? dayjs(toDate) : null}
              onChange={(value) => {
                setToDate(value?.isValid() ? value.toDate() : null);
              }}
              format="DD-MM-YYYY"
              minDate={fromDate ? dayjs(fromDate) : undefined}
              slotProps={{
                field: {
                  clearable: true,
                  onClear: () => {
                    setToDate(null);
                    setPage(0);
                  },
                },
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: {
                    width: { xs: "100%", sm: 170, md: 180, lg: 190 },
                    flex: "0 0 auto",
                    "& .MuiInputBase-root": { height: 40, fontSize: "13px" },
                    "& .MuiInputLabel-root": { fontSize: "12px" },
                  },
                },
              }}
            />
            <IconButton
              onClick={() => {
                setFromDate(null);
                setToDate(null);
                setPage(0);
              }}
              title="Clear Filters"
              sx={{
                color: "text.secondary",
                flex: "0 0 auto",
                "&:hover": { color: "error.main" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <Tooltip title="Download Excel">
              <span>
                <IconButton
                  onClick={handleDownloadExcel}
                  disabled={downloadingExcel}
                  sx={{
                    color: "#10b981",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    height: 40,
                    width: 40,
                    flex: "0 0 auto",
                  }}
                  aria-label="download excel"
                >
                  {downloadingExcel ? (
                    <CircularProgress size={18} />
                  ) : (
                    <Download size={20} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ width: "100%", borderRadius: 2, overflow: "hidden" }}>
        {(error || downloadError) && (
          <Typography color="error" variant="body2" sx={{ px: 3, pt: 1 }}>
            {error || downloadError}
          </Typography>
        )}

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 0 }}
        >
          <Table
            sx={{
              minWidth: 650,
              "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                backgroundColor: lightYellow,
              },
              "& .MuiTableBody-root .MuiTableRow-root:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
              "& .MuiTableCell-root": {
                borderBottom: "none",
                py: 1,
                px: 1,
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
              },
            }}
          >
            <TableHead
              sx={{
                bgcolor: (t) =>
                  t.palette.mode === "dark" ? "#000000" : "#ffffff",
              }}
            >
              <TableRow sx={{ height: 50 }}>
                {[
                  "SALE ORDER NUMBER",
                  "FG LOCATION",
                  "USER",
                  "DATE & TIME",
                ].map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      color: (t) =>
                        t.palette.mode === "dark" ? "#ffffff" : "#000000",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    align="center"
                    sx={{ py: 4, bgcolor: lightYellow }}
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {row.salesOrderNumber ? (
                        <MuiLink
                          component={Link}
                          href={`/so-search/${row.salesOrderNumber}`}
                          underline="hover"
                          sx={{ fontWeight: 500 }}
                        >
                          {row.salesOrderNumber}
                        </MuiLink>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{row.fgLocation || "-"}</TableCell>
                    <TableCell>{row.user || "-"}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {formatDate(row.dateTime)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredRows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        />
      </Box>
    </Box>
  );
}
