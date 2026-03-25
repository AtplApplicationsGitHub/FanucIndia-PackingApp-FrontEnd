"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  IconButton,
  Paper,
  InputBase,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  alpha,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import CheckIcon from "@mui/icons-material/Check";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import Link from "next/link";
import MuiLink from "@mui/material/Link";
import { TableChart } from "@mui/icons-material";
import { useReport, ReportRow } from "@/app/admin/components/hooks/useReport";

type StageKey = "erpImport" | "issued" | "packed" | "stored" | "storage" | "labelPrint" | "dispatched";

type StageDef = {
  key: StageKey;
  line1: string;
};

// STAGE DEFINITION
const STAGE_DEFS: StageDef[] = [
  { key: "erpImport", line1: "ERP" },
  { key: "issued", line1: "R105" },
  { key: "packed", line1: "W105" },
  { key: "stored", line1: "F105" },
  { key: "storage", line1: "Storage" },
  { key: "labelPrint", line1: "Label Print" },
  { key: "dispatched", line1: "Dispatched" },
];

//  STAGE STEPPER — all grey, green tick when done

function StageStepper({ stages }: { stages: Record<StageKey, boolean> }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const GREEN = "#22c55e";
  const dimColor = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)";
  const dimText = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.30)";
  const dimBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const dimLine = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
      {STAGE_DEFS.map((stage, idx) => {
        const isDone = stages[stage.key] === true;
        const isLast = idx === STAGE_DEFS.length - 1;

        const circleSize = 22;
        let circleSx: any = {
          width: circleSize, height: circleSize, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid", flexShrink: 0, transition: "all 0.25s ease",
        };

        if (isDone) {
          circleSx = {
            ...circleSx,
            bgcolor: GREEN,
            borderColor: GREEN,
            color: "#fff",
            boxShadow: `0 0 8px ${GREEN}55`,
          };
        } else {
          circleSx = {
            ...circleSx,
            bgcolor: dimBg,
            borderColor: dimColor,
            color: dimText,
          };
        }

        const labelColor = isDone ? (isDark ? "#ffffff" : "#111111") : dimText;
        const labelWeight = isDone ? 600 : 400;

        const nextStage = !isLast ? STAGE_DEFS[idx + 1] : null;
        const nextDone = nextStage ? stages[nextStage.key] : false;
        const lineColor = isDone && nextDone ? GREEN : isDone ? `${GREEN}44` : dimLine;
        return (
          <Box key={stage.key} sx={{ display: "flex", alignItems: "flex-start" }}>
            {/* Node + label */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 36 }}>
              <Box sx={circleSx}>
                <CheckIcon sx={{ fontSize: 11, color: isDone ? "#fff" : dimColor }} />
              </Box>
              <Box sx={{ mt: 0.5, textAlign: "center", lineHeight: 1.2 }}>
                <Typography sx={{ fontSize: "8.5px", fontWeight: labelWeight, color: labelColor, lineHeight: 1.2 }}>
                  {stage.line1}
                </Typography>
              </Box>
            </Box>

            {/* Connector line */}
            {!isLast && (
              <Box
                sx={{
                  mt: `${(22 / 2) - 1}px`,
                  width: 18,
                  height: 2,
                  borderRadius: 1,
                  flexShrink: 0,
                  bgcolor: lineColor,
                  transition: "background-color 0.3s",
                }}
              />
            )}
          </Box>
        );
      })}

      <style>{`
        @keyframes activePulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
          50%       { box-shadow: 0 0 0 7px rgba(34,197,94,0.05); }
        }
      `}</style>
    </Box>
  );
}
type GroupedRows = { customerName: string; rows: ReportRow[] }[];

function groupRowsByCustomer(rows: ReportRow[]): GroupedRows {
  const map = new Map<string, ReportRow[]>();
  for (const row of rows) {
    const key = row.customerNameText;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  return Array.from(map.entries()).map(([customerName, rows]) => ({ customerName, rows }));
}

export default function ReportPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  const [searchInput, setSearchInput] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { rows, loading, error, lookup, totalCount } = useReport({
    search: searchInput || undefined,
    payment: paymentFilter || undefined,
    salesZoneId: zoneFilter || undefined,
    customerId: customerFilter || undefined,
    date: startDate ? dayjs(startDate).format('YYYY-MM-DD') : undefined,
    status: statusFilter || undefined,
    page: currentPage,
    limit: pageSize,
  });
  const groupedRows = useMemo(() => groupRowsByCustomer(rows), [rows]);

  function handleClear() {
    setSearchInput(""); setPaymentFilter(""); setZoneFilter("");
    setStatusFilter(""); setCustomerFilter(""); setStartDate(null);
    setCurrentPage(0);
  }

  // Column Names
  const COLUMNS = [
    { id: "so", label: "SALE ORDER NUMBER", width: 160 },
    { id: "obd", label: "OUT BOUND DELIVERY", width: 170 },
    { id: "customer", label: "CUSTOMER NAME", width: 160 },
    { id: "zone", label: "SALES ZONE", width: 100 },
    { id: "payment", label: "PAYMENT", width: 90 },
    { id: "stages", label: "STATUS TIMELINE", width: 340 },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>

        {/* TOOLBAR */}
        <Box sx={{ width: "100%", mt: 1, px: { xs: 1, sm: 2 }, display: "flex", flexDirection: "column", gap: 2 }}>
          <Paper
            elevation={2}
            sx={{
              borderRadius: 2, bgcolor: "background.paper", width: "100%",
              display: "flex", flexDirection: { xs: "column", lg: "row" },
              alignItems: { xs: "stretch", lg: "center" },
              gap: 2, px: { xs: 1.5, sm: 2 }, py: 1.5,
            }}
          >
            {/* Filters */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", flex: 1, justifyContent:"center" }}>

              {/* Search */}
              <Box
                component="form"
                onSubmit={(e: React.FormEvent) => e.preventDefault()}
                sx={{
                  p: "2px 4px", display: "flex", alignItems: "center",
                  width: { xs: "100%", sm: 180 }, border: 1,
                  borderColor: isDark ? "rgba(255,255,255,0.23)" : "#e0e0e0",
                  borderRadius: "4px", height: 40, bgcolor: "background.paper",
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1, fontSize: "14px" }}
                  placeholder="Search SO / Customer"
                  value={searchInput}
                  onChange={(e) => { setSearchInput(e.target.value); setCurrentPage(0); }}
                />
                {searchInput && (
                  <IconButton sx={{ p: "5px" }} onClick={() => setSearchInput("")}>
                    <ClearIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                )}
                <IconButton type="button" sx={{ p: "5px" }}>
                  <SearchIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>

              {/* Payment */}
              <FormControl size="small" sx={{ minWidth: 100, bgcolor: "background.paper" }}>
                <Select value={paymentFilter} displayEmpty onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(0); }} sx={{ height: 40, fontSize: "14px" }}>
                  <MenuItem value="">PAYMENT</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                  <MenuItem value="false">No</MenuItem>
                </Select>
              </FormControl>

              {/* Zone */}
              <FormControl size="small" sx={{ minWidth: 110, bgcolor: "background.paper" }}>
                <Select value={zoneFilter} displayEmpty onChange={(e) => { setZoneFilter(e.target.value); setCurrentPage(0); }} sx={{ height: 40, fontSize: "14px" }}>
                  <MenuItem value="">SALES ZONE</MenuItem>
                  {lookup.salesZones.map(z => (
                    <MenuItem key={z.id} value={String(z.id)}>{z.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Status */}
              <FormControl size="small" sx={{ minWidth: 100, bgcolor: "background.paper" }}>
                <Select value={statusFilter} displayEmpty onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }} sx={{ height: 40, fontSize: "14px" }}>
                  <MenuItem value="">STATUS</MenuItem>
                  {["R105", "W105", "F105", "Dispatched"].map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Customer */}
              <FormControl size="small" sx={{ minWidth: 120, bgcolor: "background.paper" }}>
                <Select
                  value={customerFilter}
                  displayEmpty
                  onChange={(e) => { setCustomerFilter(e.target.value); setCurrentPage(0); }}
                  sx={{ height: 40, fontSize: "14px" }}
                >
                  <MenuItem value="">CUSTOMER</MenuItem>
                  {lookup.customers.map(c => (
                    <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Date */}
              <DatePicker
                label="DATE"
                value={startDate ? dayjs(startDate) : null}
                onChange={(val) => { setStartDate(val ? val.toDate() : null); setCurrentPage(0); }}
                format="DD-MM-YYYY"
                slotProps={{
                  field: { clearable: true, onClear: () => setStartDate(null) },
                  textField: { size: "small", variant: "outlined", sx: { minWidth: 140, bgcolor: "background.paper", "& .MuiInputBase-root": { height: 40, fontSize: "14px" } } },
                }}
              />

              {/* Clear all */}
              <IconButton onClick={handleClear} title="Clear Filters" sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}>
                <CloseIcon fontSize="small" />
              </IconButton>

            </Box>
          </Paper>
        </Box>

        {/* TABLE */}
        <Box sx={{ mt: 2, px: 2 }}>
          {error && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflowX: "auto" }}>
            <Table
              sx={{
                minWidth: 980,
                tableLayout: "fixed",
                "& .MuiTableBody-root .MuiTableRow-root:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
                "& .MuiTableCell-root": {
                  borderBottom: "none",
                  py: 0.5, px: 1, fontSize: "0.875rem",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                },
              }}
            >
              <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === "dark" ? "#000000" : "#ffffff" }}>
                <TableRow sx={{ height: 52 }}>
                  {COLUMNS.map(col => (
                    <TableCell
                      key={col.id}
                      sx={{
                        width: col.width,
                        minWidth: col.width,
                        color: (theme) => theme.palette.mode === "dark" ? "#ffffff" : "#000000",
                        fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.05em", whiteSpace: "nowrap",
                        ...(col.id === "stages" && {
                          fontSize: "0.7rem",
                        }),
                      }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {groupedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <AssessmentOutlinedIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1, display: "block", mx: "auto" }} />
                      <Typography variant="body2" color="text.secondary">No report data found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  groupedRows.map((group) => {
                    return (
                      <React.Fragment key={group.customerName}>

                        {/* GROUP HEADER ROW */}
                        <TableRow sx={{ bgcolor: lightYellow, '&:hover': { bgcolor: lightYellow } }}>
                          <TableCell colSpan={6} sx={{ py: 1, borderBottom: '1px solid #E0E0E0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TableChart sx={{ color: isDark ?'#FFF':'#D00000', fontSize: 20 }} />
                              <Typography variant="body2" sx={{ fontWeight: 700, color: isDark ?   '#FFF': '#D00000' }}>
                                {group.customerName} ({group.rows.length} order{group.rows.length !== 1 ? 's' : ''})
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                        {group.rows.map((row) => (
                          <TableRow key={row.rowIndex}
                            sx={{
                              backgroundColor: "background.paper",
                              "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
                            }}
                          >
                            <TableCell>
                              <MuiLink
                                component={Link}
                                href={`/so-search/${row.saleOrderNumber}${row.outboundDelivery ? '/' + row.outboundDelivery : ''}`}
                                underline="hover"
                                sx={{ fontWeight: 500 }}
                              >
                                {row.saleOrderNumber}
                              </MuiLink>
                            </TableCell>
                            <TableCell sx={{ color: isDark ? "rgba(255,255,255,0.65)" : "text.secondary", fontWeight: 500 }}>
                              {row.outboundDelivery}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500, fontSize: "0.8rem" }}>{row.customerNameText}</TableCell>
                            <TableCell sx={{ fontWeight: 500, fontSize: "0.8rem" }}>{row.salesZone}</TableCell>
                            <TableCell>
                              {row.paymentClearance ? (
                                <Box sx={{
                                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                                  padding: "3px 10px", borderRadius: "16px", border: "1px solid",
                                  borderColor: alpha(theme.palette.success.main, 0.5),
                                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                                  color: theme.palette.success.dark,
                                  fontSize: "0.75rem", fontWeight: 600, minWidth: "50px",
                                }}>Yes</Box>
                              ) : (
                                <Box sx={{
                                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                                  padding: "3px 10px", borderRadius: "16px", border: "1px solid",
                                  borderColor: alpha(theme.palette.error.main, 0.5),
                                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                                  color: theme.palette.error.main,
                                  fontSize: "0.75rem", fontWeight: 600, minWidth: "50px",
                                }}>No</Box>
                              )}
                            </TableCell>
                            <TableCell sx={{ py: 1.5, overflow: "visible", whiteSpace: "normal" }}>
                              <StageStepper stages={row.stages} />
                            </TableCell>
                          </TableRow>
                        ))}

                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={currentPage}
            onPageChange={(_, p) => setCurrentPage(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setCurrentPage(0); }}
            rowsPerPageOptions={[10, 20, 50, 100]}
            sx={{ borderTop: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
          />
        </Box>

      </Box>
    </LocalizationProvider>
  );
}