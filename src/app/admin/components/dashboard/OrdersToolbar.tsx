import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Paper,
  InputBase,
  FormControl,
  Select,
  MenuItem,
  Button,
  Tooltip,
} from "@mui/material";
import { CalendarCheck, Download } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { LookupRow } from "@/app/admin/components/types/admin";

const STATUS_OPTIONS = ["None", "R105", "W105", "F105", "Dispatched"];

type Props = {
  searchInput: string;
  onSearchInputChange: (val: string) => void;

  paymentFilter: string;
  onPaymentFilterChange: (val: string) => void;
  zoneFilter: string;
  onZoneFilterChange: (val: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (val: string) => void;
  salesZones: LookupRow[];

  startDate: Date | null;
  onStartDateChange: (val: Date | null) => void;
  endDate: Date | null;
  onEndDateChange: (val: Date | null) => void;
  onClear: () => void;
  onExport?: () => void;
  onTodayClick?: () => void;

  selectedIds?: number[];

  onBulkUpdate?: (userId: string | number) => Promise<void>;
  onBulkSkipIssue?: (status: boolean) => Promise<void>;
  assignableUsers?: { id: number; name: string }[];
  isArchiveView?: boolean;
};

export default function AdminOrdersToolbar({
  searchInput,
  onSearchInputChange,
  paymentFilter,
  onPaymentFilterChange,
  zoneFilter,
  onZoneFilterChange,
  statusFilter,
  onStatusFilterChange,
  salesZones,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClear,
  onExport,
  onTodayClick,
  selectedIds = [],

  onBulkUpdate,
  onBulkSkipIssue,
  assignableUsers = [],
  isArchiveView = false,
}: Props) {
  const [localSearch, setLocalSearch] = useState(searchInput);
  useEffect(() => {
    setLocalSearch(searchInput);
  }, [searchInput]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          width: "100%",
          mt: 1,
          px: 1,
          pb: 0,
          mb: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Main Floating Toolbar */}
        <Paper
          elevation={2}
          sx={{
            mb: 0,
            borderRadius: 2,
            bgcolor: "background.paper",
            width: "fit-content",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            px: 2,
            py: 1.5,
            mx: "auto",
          }}
        >
          <Box
            component="form"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              onSearchInputChange(localSearch.trim().replace(/\s+/g, " "));
            }}
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: 220 },
              border: 1,
              borderColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.23)"
                  : "#e0e0e0",
              borderRadius: "4px",
              height: 40,
              bgcolor: "background.paper",
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: "14px" }}
              placeholder="Search"
              inputProps={{ "aria-label": "search" }}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <IconButton
                sx={{ p: "5px" }}
                aria-label="clear"
                onClick={() => {
                  setLocalSearch("");
                  onSearchInputChange("");
                }}
              >
                <ClearIcon sx={{ fontSize: 20 }} />
              </IconButton>
            )}
            <IconButton type="submit" sx={{ p: "5px" }} aria-label="search">
              <SearchIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          {/* Payment Filter */}
          <FormControl
            size="small"
            sx={{ minWidth: 120, bgcolor: "background.paper" }}
          >
            <Select
              value={paymentFilter}
              displayEmpty
              onChange={(e) => onPaymentFilterChange(e.target.value)}
              sx={{ height: 40, fontSize: "14px" }}
            >
              <MenuItem value="">PAYMENT</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>

          {/* Zone Filter */}
          <FormControl
            size="small"
            sx={{ minWidth: 140, bgcolor: "background.paper" }}
          >
            <Select
              value={zoneFilter}
              displayEmpty
              onChange={(e) => onZoneFilterChange(e.target.value)}
              sx={{ height: 40, fontSize: "14px" }}
            >
              <MenuItem value="">SALES ZONE</MenuItem>
              {salesZones.map((zone) => (
                <MenuItem key={zone.id} value={String(zone.id)}>
                  {String(zone.name || zone.code || zone.id)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status Filter */}
          {onStatusFilterChange && (
            <FormControl
              size="small"
              sx={{ minWidth: 140, bgcolor: "background.paper" }}
            >
              <Select
                value={statusFilter ?? ""}
                displayEmpty
                onChange={(e) => onStatusFilterChange(e.target.value)}
                sx={{ height: 40, fontSize: "14px" }}
              >
                <MenuItem value="">STATUS</MenuItem>
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Date Pickers */}
          <DatePicker
            label="FROM"
            value={startDate ? dayjs(startDate) : null}
            onChange={(val) => onStartDateChange(val ? val.toDate() : null)}
            format="DD-MM-YYYY"
            minDate={isArchiveView ? undefined : dayjs().subtract(3, "day")}
            slotProps={{
              field: {
                clearable: true,
                onClear: () => onStartDateChange(null),
              },
              textField: {
                size: "small",
                variant: "outlined",
                sx: {
                  minWidth: 140,
                  bgcolor: "background.paper",
                  "& .MuiInputBase-root": { height: 40, fontSize: "14px" },
                },
              },
            }}
          />

          <DatePicker
            label="TO"
            value={endDate ? dayjs(endDate) : null}
            onChange={(val) => onEndDateChange(val ? val.toDate() : null)}
            format="DD-MM-YYYY"
            minDate={
              startDate
                ? dayjs(startDate)
                : isArchiveView
                  ? undefined
                  : dayjs().subtract(3, "day")
            }
            slotProps={{
              field: { clearable: true, onClear: () => onEndDateChange(null) },
              textField: {
                size: "small",
                variant: "outlined",
                sx: {
                  minWidth: 140,
                  bgcolor: "background.paper",
                  "& .MuiInputBase-root": { height: 40, fontSize: "14px" },
                },
              },
            }}
          />

          {/* Clear Button (Icon Only) */}
          <IconButton
            onClick={onClear}
            title="Clear Filters"
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "error.main",
                opacity: 0.8,
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {onExport && (
            <Tooltip title="Export to Excel" arrow>
              <IconButton
                onClick={onExport}
                sx={{
                  color: "#10b981", // Emerald green for Excel
                  "&:hover": { bgcolor: "rgba(16, 185, 129, 0.1)" },
                }}
              >
                <Download size={20} />
              </IconButton>
            </Tooltip>
          )}

          {/* Today Button */}
          {onTodayClick && (
            <Tooltip
              title="Today"
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: "#000000",
                    color: "#ffffff",
                    "& .MuiTooltip-arrow": {
                      color: "#000000",
                    },
                  },
                },
              }}
            >
              <IconButton
                onClick={onTodayClick}
                sx={{
                  bgcolor: "#FFC107",
                  borderRadius: "90%",
                  "&:hover": { bgcolor: "#FFD100" },
                  color: "#000000",
                }}
              >
                <CalendarCheck size={16} />
              </IconButton>
            </Tooltip>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}
