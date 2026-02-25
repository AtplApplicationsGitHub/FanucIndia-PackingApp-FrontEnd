"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  InputBase,
  FormControl,
  Select,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { X } from "lucide-react";
import { LookupRow } from "@/app/admin/components/types/admin";
import { UploadCloud, FileSpreadsheet } from "lucide-react";

const STATUS_OPTIONS = ["None", "R105", "W105", "F105", "Dispatched"];

type Props = {
  searchInput: string;
  onSearchInputChange: (val: string) => void;

  paymentFilter: string;
  onPaymentFilterChange: (val: string) => void;
  zoneFilter: string;
  onZoneFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  salesZones: LookupRow[];

  startDate: Date | null;
  onStartDateChange: (val: Date | null) => void;
  endDate: Date | null;
  onEndDateChange: (val: Date | null) => void;
  onClear: () => void;

  selectedIds?: number[];
  onBulkUpdate?: (userId: string | number) => Promise<void>;
  onBulkSkipIssue?: (status: boolean) => Promise<void>;
  assignableUsers?: { id: number; name: string }[];
};

export default function AssignOrdersToolbar({
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
  selectedIds = [],
  onBulkUpdate,
  onBulkSkipIssue,
  assignableUsers = [],
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleActionsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleActionsClose = () => {
    setAnchorEl(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 1.5, md: 1.5 },
          width: "100%",
          justifyContent: "flex-start", // Moved to left side
          alignItems: "center",
          flexWrap: "wrap",
          pt: "0.5%",
          pb: 1,
        }}
      >
        {/* Search Field */}
        <Paper
          elevation={0}
          component="form"
          onSubmit={(e) => e.preventDefault()}
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: { xs: "100%", sm: 220 },
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            height: 40,
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: "14px" }}
            placeholder="Search"
            inputProps={{ "aria-label": "search" }}
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
          />
          {searchInput && (
            <IconButton
              sx={{ p: "5px" }}
              aria-label="clear"
              onClick={() => onSearchInputChange("")}
            >
              <ClearIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
          <IconButton type="button" sx={{ p: "5px" }} aria-label="search">
            <SearchIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Paper>

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
            <MenuItem value="">
              <em>Payment</em>
            </MenuItem>
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
            <MenuItem value="">
              <em>Sales Zone</em>
            </MenuItem>
            {salesZones.map((zone) => (
              <MenuItem key={zone.id} value={String(zone.id)}>
                {String(zone.name || zone.code || zone.id)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Status Filter */}
        <FormControl
          size="small"
          sx={{ minWidth: 140, bgcolor: "background.paper" }}
        >
          <Select
            value={statusFilter}
            displayEmpty
            onChange={(e) => onStatusFilterChange(e.target.value)}
            sx={{ height: 40, fontSize: "14px" }}
          >
            <MenuItem value="">
              <em>Status</em>
            </MenuItem>
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Date Pickers */}
        <DatePicker
          label="From"
          value={startDate ? dayjs(startDate) : null}
          onChange={(val) => onStartDateChange(val ? val.toDate() : null)}
          format="DD-MM-YYYY"
          slotProps={{
            field: { clearable: true, onClear: () => onStartDateChange(null) },
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
          label="To"
          value={endDate ? dayjs(endDate) : null}
          onChange={(val) => onEndDateChange(val ? val.toDate() : null)}
          format="DD-MM-YYYY"
          minDate={startDate ? dayjs(startDate) : undefined}
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

        {/* Clear Button */}
        <Button
          onClick={onClear}
          startIcon={<X size={16} />}
          sx={{
            bgcolor: "#eeeeee",
            color: "#333",
            borderRadius: "4px",
            fontWeight: 700,
            fontSize: "13px",
            height: 40,
            px: 2,
            textTransform: "none",
            border: "1px solid #e0e0e0",
            "&:hover": {
              bgcolor: (theme) => theme.palette.primary.main,
              color: "#000",
            },
          }}
        >
          CLEAR
        </Button>

        {/* Actions Dropdown */}
        <Button
          id="actions-button"
          aria-controls={open ? "actions-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          variant="contained"
          disableElevation
          onClick={handleActionsClick}
          endIcon={<KeyboardArrowDownIcon />}
          sx={{
            bgcolor: "#facd02",
            color: "#000",
            fontWeight: 700,
            fontSize: "14px",
            height: 40,
            px: 3,
            borderRadius: 0,
            clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
            "&:hover": {
              bgcolor: "#e5bb01",
            },
            textTransform: "uppercase",
            ml: { md: "auto" },
          }}
        >
          ACTIONS
        </Button>
        <Menu
          id="actions-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleActionsClose}
          MenuListProps={{
            "aria-labelledby": "actions-button",
          }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 180,
              boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
              borderRadius: "4px",
            },
          }}
        >
          <MenuItem onClick={handleActionsClose} sx={{ py: 1.5, gap: 1.5 }}>
            <FileSpreadsheet size={18} color="#2e7d32" /> Export
          </MenuItem>
          <MenuItem onClick={handleActionsClose} sx={{ py: 1.5, gap: 1.5 }}>
            <UploadCloud size={18} color="#0288d1" /> Upload
          </MenuItem>
        </Menu>
      </Box>
    </LocalizationProvider>
  );
}
