"use client";

import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  Button,
  alpha,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Download } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useEfficiencyReport } from "@/app/admin/components/hooks/useEfficiencyReport";
import { CommonIconButton } from "@/common/components/CommonButton";

export default function EfficiencyReport() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [startDate, setStartDate] = React.useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = React.useState<Dayjs | null>(dayjs());
  const [stage, setStage] = React.useState<"Issue" | "Packing">("Issue");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const { rows, loading, error } = useEfficiencyReport(
    startDate,
    endDate,
    stage,
  );

  React.useEffect(() => {
    setPage(0);
  }, [rows]);

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  // Bin group colors (visible in both light & dark)
  const binColors = {
    bin1: isDark ? "#1c3557" : "#dbeafe", // blue
    bin2to3: isDark ? "#1a3d2f" : "#d1fae5", // green
    bin4plus: isDark ? "#35194f" : "#ede9fe", // purple
  };

  // Vertical divider border (left border on first col of each bin group)
  const dividerBorder = {
    borderLeft: "2px solid",
    borderLeftColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)",
  };

  //  Header styles
  const baseHeaderSx = {
    fontWeight: 700,
    fontSize: "0.75rem",
    textTransform: "uppercase" as const,
    color: isDark ? "#FFFFFF" : "#000000",
    py: 1,
    textAlign: "center" as const,
    borderBottom: "1px solid",
    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
  };

  const plainHeaderSx = {
    ...baseHeaderSx,
    bgcolor: isDark ? "#000000" : "#FFFFFF",
  };

  const subHeaderSx = {
    ...baseHeaderSx,
    fontSize: "0.75rem",
    py: 1,
  };

  const bodyCellSx = {
    fontSize: "0.875rem",
    py: 0.75,
    borderBottom: "none",
  };

  const bodyCellCenterSx = {
    ...bodyCellSx,
    textAlign: "center" as const,
  };

  // Date picker shared props
  const datePickerSlotProps = {
    textField: {
      size: "small" as const,
      sx: {
        width: 190,
        "& .MuiInputBase-input": {
          color: theme.palette.text.primary,
          fontWeight: 600,
          fontSize: "0.95rem",
        },
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          "& fieldset": {
            borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
          },
          "&:hover fieldset": {
            borderColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
          },
          "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
          },
        },
        "& .MuiInputLabel-root": {
          color: "#9CA3AF",
          fontWeight: 700,
          fontSize: "0.75rem",
          textTransform: "uppercase",
        },
        "& .MuiIconButton-root": {
          color: theme.palette.text.secondary,
        },
      },
    },
    field: { clearable: true },
  };

  const handleDownloadExcel = async () => {
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`${stage} Stage`);

    // Header row 1
    sheet.addRow([
      "Required Date",
      "Operator",
      "1 Bin",
      "",
      "",
      "2-3 Bins",
      "",
      "",
      ">=4 Bins",
      "",
      "",
    ]);

    // Header row 2
    sheet.addRow([
      "",
      "",
      "SO Count",
      "Lead Time (mins)",
      "Process Time (mins)",
      "SO Count",
      "Lead Time (mins)",
      "Process Time (mins)",
      "SO Count",
      "Lead Time (mins)",
      "Process Time (mins)",
    ]);

    // Merge cells
    sheet.mergeCells("A1:A2"); // Required Date
    sheet.mergeCells("B1:B2"); // Operator
    sheet.mergeCells("C1:E1"); // 1 Bin
    sheet.mergeCells("F1:H1"); // 2-3 Bins
    sheet.mergeCells("I1:K1"); // >=4 Bins
    sheet.getCell("C1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    sheet.getCell("F1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    sheet.getCell("I1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    // Column widths
    sheet.columns = [
      { width: 15 },
      { width: 22 },
      { width: 10 },
      { width: 18 },
      { width: 20 },
      { width: 10 },
      { width: 18 },
      { width: 20 },
      { width: 10 },
      { width: 18 },
      { width: 20 },
    ];

    // Data rows
    rows.forEach((row) => {
      sheet.addRow([
        row.requiredDate,
        row.operator,
        row.bin1.count || 0,
        row.bin1.leadTime ?? "-",
        row.bin1.processTime ?? "-",
        row.bin2to3.count || 0,
        row.bin2to3.leadTime ?? "-",
        row.bin2to3.processTime ?? "-",
        row.bin4plus.count || 0,
        row.bin4plus.leadTime ?? "-",
        row.bin4plus.processTime ?? "-",
      ]);
    });

    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const from = startDate ? startDate.format("YYYY-MM-DD") : "all";
    const to = endDate ? endDate.format("YYYY-MM-DD") : "all";
    a.href = url;
    a.download = `Efficiency_${stage}_${from}_to_${to}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const TOTAL_COLS = 11;

  const paginatedRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          mt: 1,
          px: { xs: 1, sm: 2 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* ── Filter Bar ── */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            bgcolor: "background.paper",
            width: "fit-content",
            mx: "auto",
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: { xs: "stretch", lg: "center" },
            gap: 0.5,
            px: { xs: 1.5, sm: 2 },
            py: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "nowrap",
              gap: 1,
              alignItems: "center",
              flex: 1,
              width: "100%",
              minWidth: 0,
            }}
          >
            <DatePicker
              label="FROM"
              value={startDate}
              onChange={(val) => setStartDate(val)}
              format="DD-MM-YYYY"
              slotProps={{
                ...datePickerSlotProps,
                field: {
                  ...datePickerSlotProps.field,
                  onClear: () => setStartDate(null),
                } as any,
              }}
            />
            <DatePicker
              label="TO"
              value={endDate}
              onChange={(val) => setEndDate(val)}
              format="DD-MM-YYYY"
              minDate={startDate ? startDate : undefined}
              slotProps={{
                ...datePickerSlotProps,
                field: {
                  ...datePickerSlotProps.field,
                  onClear: () => setEndDate(null),
                } as any,
              }}
            />

            {/* Clear */}
            <Tooltip title="Clear Filters">
              <IconButton
                onClick={handleClearFilters}
                size="small"
                sx={{
                  color: "text.secondary",
                  flex: "0 0 auto",
                  "&:hover": { color: "error.main" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Excel Download */}
            <Tooltip title="Export to Excel">
              <CommonIconButton
                onClick={handleDownloadExcel}
                size="small"
                sx={{
                  color: "success.main",
                  "&:hover": {
                    color: "success.dark",
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                  },
                }}
              >
                <Download size={20} />
              </CommonIconButton>
            </Tooltip>

            {/* Stage toggle */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "action.hover",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                flex: "0 0 auto",
              }}
            >
              {(["Issue", "Packing"] as const).map((s) => (
                <Button
                  key={s}
                  onClick={() => setStage(s)}
                  disableRipple
                  size="small"
                  sx={{
                    px: 1.6,
                    py: 0.65,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    borderRadius: 1.5,
                    textTransform: "none",
                    minWidth: "unset",
                    bgcolor: stage === s ? "background.paper" : "transparent",
                    color: stage === s ? "#D00000" : "text.secondary",
                    boxShadow: stage === s ? 1 : "none",
                    "&:hover": {
                      bgcolor: stage === s ? "background.paper" : "transparent",
                      color: stage === s ? "#D00000" : "text.primary",
                    },
                  }}
                >
                  {s === "Issue" ? "Issued" : "Packed"}
                </Button>
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Efficiency Table */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
            bgcolor: isDark ? "#1F2933" : "#ffffff",
          }}
        >
          <TableContainer
            sx={{
              maxHeight: "calc(100vh - 280px)",
              "&::-webkit-scrollbar": { width: 6, height: 6 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                borderRadius: 3,
              },
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                {/* Row 1 — group headers */}
                <TableRow>
                  <TableCell rowSpan={2} sx={plainHeaderSx}>
                    Required Date
                  </TableCell>
                  <TableCell rowSpan={2} sx={plainHeaderSx}>
                    Operator
                  </TableCell>
                  <TableCell
                    colSpan={3}
                    sx={{
                      ...baseHeaderSx,
                      bgcolor: binColors.bin1,
                      ...dividerBorder,
                    }}
                  >
                    1 Bin
                  </TableCell>
                  <TableCell
                    colSpan={3}
                    sx={{
                      ...baseHeaderSx,
                      bgcolor: binColors.bin2to3,
                      ...dividerBorder,
                    }}
                  >
                    2-3 Bins
                  </TableCell>
                  <TableCell
                    colSpan={3}
                    sx={{
                      ...baseHeaderSx,
                      bgcolor: binColors.bin4plus,
                      ...dividerBorder,
                    }}
                  >
                    &ge;4 Bins
                  </TableCell>
                </TableRow>

                {/* Row 2 — sub-column headers */}
                <TableRow>
                  {/* 1 Bin */}
                  <TableCell
                    sx={{
                      ...subHeaderSx,
                      bgcolor: binColors.bin1,
                      ...dividerBorder,
                    }}
                  >
                    SO Count
                  </TableCell>
                  <TableCell sx={{ ...subHeaderSx, bgcolor: binColors.bin1 }}>
                    Lead Time (mins)
                  </TableCell>
                  <TableCell sx={{ ...subHeaderSx, bgcolor: binColors.bin1 }}>
                    Process Time (mins)
                  </TableCell>
                  {/* 2-3 Bins */}
                  <TableCell
                    sx={{
                      ...subHeaderSx,
                      bgcolor: binColors.bin2to3,
                      ...dividerBorder,
                    }}
                  >
                    SO Count
                  </TableCell>
                  <TableCell
                    sx={{ ...subHeaderSx, bgcolor: binColors.bin2to3 }}
                  >
                    Lead Time (mins)
                  </TableCell>
                  <TableCell
                    sx={{ ...subHeaderSx, bgcolor: binColors.bin2to3 }}
                  >
                    Process Time (mins)
                  </TableCell>
                  {/* >=4 Bins */}
                  <TableCell
                    sx={{
                      ...subHeaderSx,
                      bgcolor: binColors.bin4plus,
                      ...dividerBorder,
                    }}
                  >
                    SO Count
                  </TableCell>
                  <TableCell
                    sx={{ ...subHeaderSx, bgcolor: binColors.bin4plus }}
                  >
                    Lead Time (mins)
                  </TableCell>
                  <TableCell
                    sx={{ ...subHeaderSx, bgcolor: binColors.bin4plus }}
                  >
                    Process Time (mins)
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={TOTAL_COLS}
                      align="center"
                      sx={{ py: 10 }}
                    >
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={TOTAL_COLS}
                      align="center"
                      sx={{ py: 10 }}
                    >
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={2}
                      >
                        <Typography fontWeight={700}>No data found</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row, index) => (
                    <TableRow
                      key={`${row.operator}-${row.requiredDate}-${index}`}
                      hover
                      sx={{
                        bgcolor: isDark
                          ? index % 2 === 0
                            ? "#3A3A1E"
                            : "#1A1F26"
                          : index % 2 === 0
                            ? "#FFF8DC"
                            : "#FFFFFF",
                      }}
                    >
                      <TableCell sx={bodyCellSx}>
                        {dayjs(row.requiredDate).format("DD-MM-YYYY")}
                      </TableCell>
                      <TableCell sx={bodyCellSx}>{row.operator}</TableCell>
                      {/* 1 Bin */}
                      <TableCell
                        sx={{
                          ...bodyCellCenterSx,
                          ...dividerBorder,
                          bgcolor: binColors.bin1,
                        }}
                      >
                        {row.bin1.count || "-"}
                      </TableCell>
                      <TableCell
                        sx={{ ...bodyCellCenterSx, bgcolor: binColors.bin1 }}
                      >
                        {row.bin1.leadTime ?? "-"}
                      </TableCell>
                      <TableCell
                        sx={{ ...bodyCellCenterSx, bgcolor: binColors.bin1 }}
                      >
                        {row.bin1.processTime ?? "-"}
                      </TableCell>
                      {/* 2-3 Bins */}
                      <TableCell
                        sx={{
                          ...bodyCellCenterSx,
                          ...dividerBorder,
                          bgcolor: binColors.bin2to3,
                        }}
                      >
                        {row.bin2to3.count || "-"}
                      </TableCell>
                      <TableCell
                        sx={{ ...bodyCellCenterSx, bgcolor: binColors.bin2to3 }}
                      >
                        {row.bin2to3.leadTime ?? "-"}
                      </TableCell>
                      <TableCell
                        sx={{ ...bodyCellCenterSx, bgcolor: binColors.bin2to3 }}
                      >
                        {row.bin2to3.processTime ?? "-"}
                      </TableCell>
                      {/* >=4 Bins */}
                      <TableCell
                        sx={{
                          ...bodyCellCenterSx,
                          ...dividerBorder,
                          bgcolor: binColors.bin4plus,
                        }}
                      >
                        {row.bin4plus.count || "-"}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...bodyCellCenterSx,
                          bgcolor: binColors.bin4plus,
                        }}
                      >
                        {row.bin4plus.leadTime ?? "-"}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...bodyCellCenterSx,
                          bgcolor: binColors.bin4plus,
                        }}
                      >
                        {row.bin4plus.processTime ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={rows.length}
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
              borderColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.06)",
              color: "text.secondary",
              ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                {
                  fontSize: "0.8rem",
                },
            }}
          />
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}
