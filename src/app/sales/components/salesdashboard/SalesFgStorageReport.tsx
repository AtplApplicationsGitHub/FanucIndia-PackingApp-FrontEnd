"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Paper, Typography, alpha, useTheme, IconButton,
  InputBase, Link as MuiLink, Tooltip, Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import Link from "next/link";
import { useEffect } from "react";
import { formatDateTimeIST } from "@/common/utils/dateTime";
import { exportToExcel } from "@/app/admin/components/utils/exportExcel";
import { Download } from "lucide-react";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { useSalesFgStorageReport } from "../hooks/useSalesFgStorageReport";

function formatDate(iso: string) {
  if (!iso || iso === "-") return "-";
  try { return formatDateTimeIST(iso); } catch { return iso; }
}

export default function SalesFgStorageReport() {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [ageFilter, setAgeFilter] = React.useState<string | null>(null);

  useEffect(() => { setPage(0); }, [search]);
  useEffect(() => { setPage(0); }, [ageFilter]);

  const { rows, totalCount, loading, error, ageCounts } = useSalesFgStorageReport(
    page, rowsPerPage, search, ageFilter ?? undefined,
  );

  const handleExport = async () => {
    try {
      const url = API.SALES.SALES_FG_STORAGE_REPORT({ page: 1, limit: 1000000, search: search || undefined, ageFilter: ageFilter || undefined });
      const res = await fetchWithAuth(url);
      const json = await res.json();
      const allData = json.data?.reportData || [];
      const formatted = allData.map((row: any) => ({
        Location: row.fgLocation && row.fgLocation !== "N/A" ? row.fgLocation : "-",
        "Sale Order Number": row.saleOrderNumber || "-",
        "Outbound Delivery": row.outboundDelivery || "-",
        "Sales Zone": row.salesZoneName || "-",
        "Customer Name": row.customerName || "-",
        "Last Updated By": row.LastUpdatedBy || "-",
        "Date & Time": formatDate(row.dateTime),
        Duration: row.durationText || "-",
      }));
      const now = new Date();
      const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
      const dt = ist.toISOString().replace(/[-:T]/g, "_").slice(0, 19);
      await exportToExcel(formatted, `FG_Storage_Sales_${dt}`);
    } catch (err) { console.error("Failed to export", err); }
  };

  const headers = [
    "LOCATION", "SALE ORDER NUMBER", "OUT BOUND DELIVERY",
    "SALES ZONE", "CUSTOMER NAME",
    "LAST UPDATED BY", "DATE & TIME", "DURATION",
  ];

  return (
    <Box sx={{ width: "100%", minWidth: 0, pt: 1, pb: 4, px: { xs: 2, md: 4 } }}>
      <Paper elevation={2} sx={{ mb: 3, borderRadius: 3, bgcolor: "background.paper", display: "flex", alignItems: "center", flexWrap: { xs: "wrap", xl: "nowrap" }, gap: 2, px: 2.5, py: 1.5, mx: "auto", width: { xs: "100%", xl: "fit-content" } }}>
        <Box component="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput.trim().replace(/\s+/g, " ")); }}
          sx={{ p: "2px 4px", display: "flex", alignItems: "center", width: { xs: "100%", sm: 280 }, border: 1, borderColor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.23)" : "#e0e0e0", borderRadius: "4px", height: 40, bgcolor: "background.paper", flexShrink: 0 }}>
          <InputBase sx={{ ml: 1, flex: 1, fontSize: "14px" }} placeholder="Search" value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); if (e.target.value === "") setSearch(""); }} />
          {searchInput && <IconButton sx={{ p: "5px" }} onClick={() => { setSearchInput(""); setSearch(""); }}><ClearIcon sx={{ fontSize: 20 }} /></IconButton>}
          <IconButton type="submit" sx={{ p: "5px" }}><SearchIcon sx={{ fontSize: 20 }} /></IconButton>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", xl: "block" }, mx: 0.5 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          {[
            { label: "0–3 Months", value: "0-3", count: ageCounts.age0to3Months },
            { label: "3–6 Months", value: "3-6", count: ageCounts.age3to6Months },
            { label: "6–12 Months", value: "6-12", count: ageCounts.age6to12Months },
            { label: "> 12 Months", value: ">12", count: ageCounts.ageAbove12Months },
          ].map((card) => {
            const isActive = ageFilter === card.value;
            const color = "#F59E0B";
            return (
              <Box key={card.value} onClick={() => setAgeFilter(isActive ? null : card.value)}
                sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1, borderRadius: "24px", border: "1px solid", borderColor: isActive ? color : "divider", bgcolor: isActive ? alpha(color, 0.1) : "transparent", cursor: "pointer", transition: "all 0.2s", "&:hover": { bgcolor: alpha(color, 0.05), borderColor: color } }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: isActive ? color : "text.secondary", whiteSpace: "nowrap" }}>{card.label}</Typography>
                <Box sx={{ minWidth: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", px: 1, borderRadius: "12px", bgcolor: isActive ? color : alpha(theme.palette.text.primary, 0.08), color: isActive ? "#fff" : "text.primary", fontSize: "0.75rem", fontWeight: 700 }}>{card.count}</Box>
              </Box>
            );
          })}
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", xl: "block" }, mx: 0.5 }} />

        <Tooltip title="Export to Excel">
          <IconButton onClick={handleExport} sx={{ color: "#10B981", bgcolor: alpha("#10B981", 0.1), borderRadius: 2, height: 42, width: 42, flexShrink: 0, "&:hover": { bgcolor: alpha("#10B981", 0.2) } }}>
            <Download size={20} />
          </IconButton>
        </Tooltip>
      </Paper>

      <Paper elevation={0} sx={{ width: "100%", borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden", bgcolor: "background.paper" }}>
        {error && <Typography color="error" variant="body2" sx={{ px: 3, pt: 1 }}>{error}</Typography>}
        <TableContainer>
          <Table sx={{ minWidth: 900, "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": { backgroundColor: lightYellow }, "& .MuiTableBody-root .MuiTableRow-root:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.2) }, "& .MuiTableCell-root": { borderBottom: "none", py: 1.5, px: 2, fontSize: "0.875rem", whiteSpace: "nowrap" } }}>
            <TableHead sx={{ bgcolor: (t) => t.palette.mode === "dark" ? "#000000" : "#ffffff" }}>
              <TableRow sx={{ height: 60 }}>
                {headers.map((head) => (
                  <TableCell key={head} sx={{ color: (t) => t.palette.mode === "dark" ? "#ffffff" : "#000000", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? null : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, bgcolor: lightYellow }}>No records found.</TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.fgLocation && row.fgLocation !== "N/A" ? row.fgLocation : "-"}</TableCell>
                    <TableCell>
                      <MuiLink component={Link} href={`/so-search/${row.saleOrderNumber}${row.outboundDelivery ? "/" + row.outboundDelivery : ""}`} underline="hover" sx={{ fontWeight: 500 }}>
                        {row.saleOrderNumber}
                      </MuiLink>
                    </TableCell>
                    <TableCell>{row.outboundDelivery || "-"}</TableCell>
                    <TableCell>{row.salesZoneName}</TableCell>
                    <TableCell>{row.customerName}</TableCell>
                    <TableCell>{row.LastUpdatedBy}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{formatDate(row.dateTime)}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: (t) => t.palette.mode === "dark" ? "#60a5fa" : "#2563eb" }}>{row.durationText}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <TablePagination component="div" count={totalCount} page={page}
        onPageChange={(_, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 20, 50, 100]} sx={{ bgcolor: "transparent" }} />
    </Box>
  );
}