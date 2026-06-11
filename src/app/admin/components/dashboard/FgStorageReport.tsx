"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  alpha,
  useTheme,
  InputAdornment,
  IconButton,
  InputBase,
  Link as MuiLink,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import Link from "next/link";
import { useFgStorageReport } from "@/app/admin/components/hooks/useFgStorageReport";
import { useEffect } from "react";
import { formatDateTimeIST } from "@/common/utils/dateTime";
import { exportToExcel } from "@/app/admin/components/utils/exportExcel";
import { Download } from "lucide-react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

function formatDate(iso: string) {
  if (!iso || iso === "-") return "-";
  try {
    return formatDateTimeIST(iso);
  } catch {
    return iso;
  }
}

export default function FgStorageReportPanel() {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [ageFilter, setAgeFilter] = React.useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [ageFilter]);

  const { rows, totalCount, loading, error, ageCounts } = useFgStorageReport(
    page,
    rowsPerPage,
    search,
    ageFilter ?? undefined,
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearch(searchInput.trim().replace(/\s+/g, " "));
    }
  };

  // --- ADDED CLEAR FUNCTION ---
  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  const handleExport = async () => {
    try {
      // Fetch all records matching the current search query (bypass pagination)
      const url = API.ADMIN.FG_STORAGE_REPORT({
        page: 1,
        limit: 1000000,
        search: search || undefined,
        ageFilter: ageFilter || undefined,
      });
      const res = await fetchWithAuth(url);
      const json = await res.json();
      const allData = json.data?.reportData || [];

      const formatted = allData.map((row: any) => ({
        Location:
          row.fgLocation && row.fgLocation !== "N/A" ? row.fgLocation : "-",
        "Sale Order Number": row.saleOrderNumber || "-",
        "Outbound delivery": row.outboundDelivery || "-",
        "Last UpdatedBy": row.LastUpdatedBy || "-",
        "Date & Time": formatDate(row.dateTime),
        Duration: row.durationText || "-",
      }));

      await exportToExcel(
        formatted,
        `FG_Storage_Report_${new Date().toISOString().split("T")[0]}`,
      );
    } catch (err) {
      console.error("Failed to export", err);
    }
  };

  return (
    <Box
      sx={{ width: "100%", minWidth: 0, pt: 1, pb: 4, px: { xs: 2, md: 4 } }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 1.5,
          mb: 2,
          flexWrap: "wrap",
          justifyContent: "center",
          pl: { xs: 0, md: 30 },
        }}
      >
        {/* Search Bar */}
        <Box
          component="form"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            setSearch(searchInput.trim().replace(/\s+/g, " "));
          }}
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: 300 },
            border: 1,
            borderColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.23)"
                : "#e0e0e0",
            borderRadius: "4px",
            height: 40,
            bgcolor: "background.paper",
            flexShrink: 0,
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: "14px" }}
            placeholder="Search"
            inputProps={{ "aria-label": "search" }}
            value={searchInput}
            onChange={(e) => {
              const val = e.target.value;
              setSearchInput(val);
              if (val === "") setSearch("");
            }}
            onKeyDown={handleSearchKeyDown}
          />
          {searchInput && (
            <IconButton
              sx={{ p: "5px" }}
              aria-label="clear"
              onClick={handleClearSearch}
            >
              <ClearIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
          <IconButton type="submit" sx={{ p: "5px" }} aria-label="search">
            <SearchIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
        {/* Export Button */}
        <Tooltip title="Export to Excel">
          <IconButton
            onClick={handleExport}
            sx={{
              color: "#10b981",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              height: 40,
              width: 40,
              flexShrink: 0,
            }}
          >
            <Download size={20} />
          </IconButton>
        </Tooltip>

        {/* Age Filter KPI Cards */}
        {[
          {
            label: "0–3 months",
            value: "0-3",
            count: ageCounts.age0to3Months,
            bg: "#E1F5EE",
            color: "#085041",
            iconColor: "#0F6E56",
            border: "#9FE1CB",
          },
          {
            label: "3–6 months",
            value: "3-6",
            count: ageCounts.age3to6Months,
            bg: "#E6F1FB",
            color: "#0C447C",
            iconColor: "#185FA5",
            border: "#B5D4F4",
          },
          {
            label: "6–12 months",
            value: "6-12",
            count: ageCounts.age6to12Months,
            bg: "#FAEEDA",
            color: "#633806",
            iconColor: "#854F0B",
            border: "#FAC775",
          },
          {
            label: "12+ months",
            value: ">12",
            count: ageCounts.ageAbove12Months,
            bg: "#EEEDFE",
            color: "#3C3489",
            iconColor: "#534AB7",
            border: "#CECBF6",
          },
        ].map((card) => {
          const isActive = ageFilter === card.value;
          return (
            <Box
              key={card.value}
              onClick={() => setAgeFilter(isActive ? null : card.value)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                px: 1,
                py: 1,
                borderRadius: "8px",
                border: `1px solid ${isActive ? card.iconColor : card.border}`,
                bgcolor: card.bg,
                cursor: "pointer",
                userSelect: "none",
                minWidth: 50,
                outline: isActive ? `2px solid ${card.iconColor}` : "none",
                outlineOffset: "2px",
                transition: "all 0.15s",
                "&:hover": { opacity: 0.85 },
              }}
            >
              {/* Icon + Number row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  mb: "1px",
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 14, color: card.iconColor }} />
                <Typography
                  sx={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: card.color,
                    lineHeight: 0.5,
                  }}
                >
                  {card.count}
                </Typography>
              </Box>
              {/* Label */}
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  color: card.color,
                  lineHeight: 1,
                }}
              >
                {card.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        {error && (
          <Typography color="error" variant="body2" sx={{ px: 3, pt: 1 }}>
            {error}
          </Typography>
        )}
        <TableContainer>
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
                py: 1.5,
                px: 2,
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
              <TableRow sx={{ height: 60 }}>
                {[
                  "LOCATION",
                  "SALE ORDER NUMBER",
                  "OUT BOUND DELIVERY",
                  "LAST UPDATED BY",
                  "DATE & TIME",
                  "DURATION",
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
              {loading ? null : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 4, bgcolor: lightYellow }}
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow key={idx}>
                    {/* LOCATION */}
                    <TableCell>
                      {row.fgLocation && row.fgLocation !== "N/A"
                        ? row.fgLocation
                        : "-"}
                    </TableCell>

                    {/* SO NUMBER */}
                    <TableCell>
                      <MuiLink
                        component={Link}
                        href={`/so-search/${row.saleOrderNumber}${row.outboundDelivery ? "/" + row.outboundDelivery : ""}`}
                        underline="hover"
                        sx={{ fontWeight: 500 }}
                      >
                        {row.saleOrderNumber}
                      </MuiLink>
                    </TableCell>

                    {/* OBD */}
                    <TableCell>{row.outboundDelivery || "-"}</TableCell>

                    {/* LAST UPDATED BY */}
                    <TableCell>{row.LastUpdatedBy}</TableCell>

                    {/* DATE & TIME */}
                    <TableCell sx={{ color: "text.secondary" }}>
                      {formatDate(row.dateTime)}
                    </TableCell>

                    {/* DURATION */}
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: (t) =>
                          t.palette.mode === "dark" ? "#60a5fa" : "#2563eb",
                      }}
                    >
                      {row.durationText}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 20, 50, 100]}
        sx={{
          bgcolor: "transparent",
        }}
      />
    </Box>
  );
}
