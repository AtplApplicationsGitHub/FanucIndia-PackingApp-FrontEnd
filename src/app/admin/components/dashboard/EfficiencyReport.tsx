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
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  Button,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useEfficiencyReport } from "@/app/admin/components/hooks/useEfficiencyReport";

export default function EfficiencyReport() {
  const theme = useTheme();

  const [startDate, setStartDate] = React.useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = React.useState<Dayjs | null>(dayjs());
  const [stage, setStage] = React.useState<"Issue" | "Packing">("Issue");
  const { rows, loading, error } = useEfficiencyReport(
    startDate,
    endDate,
    stage,
  );

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const headerCellSx = {
    fontWeight: 700,
    fontSize: "0.75rem",
    textTransform: "uppercase",
    color: theme.palette.mode === "dark" ? "#FFFFFF" : "#000000",
    bgcolor: theme.palette.mode === "dark" ? "#000000" : "#FFFFFF",
    py: 1,
    textAlign: "center" as const,
    borderBottom: "1px solid",
    borderColor:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.1)"
        : "rgba(0,0,0,0.08)",
  };

  const subHeaderCellSx = {
    ...headerCellSx,
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
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.2)"
                : "rgba(0,0,0,0.15)",
          },
          "&:hover fieldset": {
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.3)"
                : "rgba(0,0,0,0.3)",
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
    field: {
      clearable: true,
    },
  };

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
        {/* Filter Bar */}
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
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.06)",
            bgcolor: theme.palette.mode === "dark" ? "#1F2933" : "#ffffff",
          }}
        >
          <TableContainer
            sx={{
              maxHeight: "calc(100vh - 280px)",
              "&::-webkit-scrollbar": { width: 6, height: 6 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                borderRadius: 3,
              },
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell rowSpan={2} sx={headerCellSx}>
                    Operator
                  </TableCell>
                  <TableCell colSpan={2} sx={headerCellSx}>
                    1 Bin
                  </TableCell>
                  <TableCell colSpan={2} sx={headerCellSx}>
                    2-3 Bins
                  </TableCell>
                  <TableCell colSpan={2} sx={headerCellSx}>
                    &ge;4 Bins
                  </TableCell>
                </TableRow>
                <TableRow>
                  {/* 1 Bin */}
                  <TableCell sx={subHeaderCellSx}>
                    Lead Time (in mins)
                  </TableCell>
                  <TableCell sx={subHeaderCellSx}>
                    Process Time (in mins)
                  </TableCell>
                  {/* 2-3 Bin */}
                  <TableCell sx={subHeaderCellSx}>
                    Lead Time (in mins)
                  </TableCell>
                  <TableCell sx={subHeaderCellSx}>
                    Process Time (in mins)
                  </TableCell>
                  {/* >=4 Bin */}
                  <TableCell sx={subHeaderCellSx}>
                    Lead Time (in mins)
                  </TableCell>
                  <TableCell sx={subHeaderCellSx}>
                    Process Time (in mins)
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
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
                  rows.map((row, index) => (
                    <TableRow
                      key={`${row.operator}-${index}`}
                      hover
                      sx={{
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? index % 2 === 0
                              ? "#3A3A1E"
                              : "#1A1F26"
                            : index % 2 === 0
                              ? "#FFF8DC"
                              : "#FFFFFF",
                      }}
                    >
                      <TableCell sx={{ ...bodyCellSx }}>
                        {row.operator}
                      </TableCell>
                      <TableCell sx={bodyCellCenterSx}>
                        {row.bin1.leadTime ?? "-"}
                      </TableCell>
                      <TableCell sx={bodyCellCenterSx}>
                        {row.bin1.processTime ?? "-"}
                      </TableCell>
                      <TableCell sx={bodyCellCenterSx}>
                        {row.bin2to3.leadTime ?? "-"}
                      </TableCell>
                      <TableCell sx={bodyCellCenterSx}>
                        {row.bin2to3.processTime ?? "-"}
                      </TableCell>
                      <TableCell sx={bodyCellCenterSx}>
                        {row.bin4plus.leadTime ?? "-"}
                      </TableCell>
                      <TableCell sx={bodyCellCenterSx}>
                        {row.bin4plus.processTime ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}
