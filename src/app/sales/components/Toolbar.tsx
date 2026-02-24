"use client";

import React from "react";
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
  Stack,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { 
  Plus, 
  Download, 
  UploadCloud, 
  ChevronDown, 
  FileSpreadsheet, 
  PackagePlus,
  Filter,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

const STATUS_OPTIONS = ["None", "R105", "W105", "F105", "Dispatched"];

type Props = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  onDownload: () => void;
  onBulkUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  // Filters
  paymentFilter: string;
  onPaymentFilterChange: (val: string) => void;
  zoneFilter: string;
  onZoneFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  salesZones: { id: number; name: string }[];
  startDate: Date | null;
  onStartDateChange: (val: Date | null) => void;
  endDate: Date | null;
  onEndDateChange: (val: Date | null) => void;
  onClear: () => void;
};

export default function SalesDashboardToolbar({
  searchValue,
  onSearchChange,
  onCreate,
  onDownload,
  onBulkUpload,
  fileInputRef,
  onFileChange,
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
}: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", lg: "center" },
            mb: 1,
            p: 1,
            gap: 1,
          }}
        >
          {/* SEARCH & FILTERS (Left Side) */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems="center"
            flexGrow={1}
            flexWrap="wrap"
          >
            <Paper
              elevation={0}
              component="form"
              onSubmit={(e) => e.preventDefault()}
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", md: 240 },
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                height: 40,
                transition: "all 0.2s",
                "&:focus-within": {
                  borderColor: "primary.main",
                  boxShadow: "0 0 0 2px rgba(255, 215, 0, 0.1)",
                },
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1, fontSize: "14px" }}
                placeholder="Search orders..."
                inputProps={{ "aria-label": "search" }}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchValue && (
                <IconButton
                  size="small"
                  onClick={() => onSearchChange("")}
                  sx={{ p: "5px" }}
                >
                  <ClearIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
              <IconButton type="button" sx={{ p: "8px" }} size="small">
                <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              </IconButton>
            </Paper>

            <FormControl size="small" sx={{ minWidth: 110 }}>
              <Select
                value={paymentFilter}
                displayEmpty
                onChange={(e) => onPaymentFilterChange(e.target.value)}
                sx={{ 
                  height: 40, 
                  fontSize: "13px", 
                  borderRadius: "8px",
                  "& .MuiSelect-select": { py: 1 }
                }}
              >
                <MenuItem value="">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Filter size={14} /> <em>Payment</em>
                  </Box>
                </MenuItem>
                <MenuItem value="true">Paid</MenuItem>
                <MenuItem value="false">Unpaid</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={zoneFilter}
                displayEmpty
                onChange={(e) => onZoneFilterChange(e.target.value)}
                sx={{ 
                  height: 40, 
                  fontSize: "13px", 
                  borderRadius: "8px",
                }}
              >
                <MenuItem value=""><em>Sales Zone</em></MenuItem>
                {salesZones.map((zone) => (
                  <MenuItem key={zone.id} value={String(zone.id)}>
                    {zone.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={statusFilter}
                displayEmpty
                onChange={(e) => onStatusFilterChange(e.target.value)}
                sx={{ 
                  height: 40, 
                  fontSize: "13px", 
                  borderRadius: "8px",
                }}
              >
                <MenuItem value=""><em>Status</em></MenuItem>
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DatePicker
              label="From"
              value={startDate ? dayjs(startDate) : null}
              onChange={(val) => onStartDateChange(val ? val.toDate() : null)}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    minWidth: 140,
                    "& .MuiInputBase-root": { height: 40, fontSize: "13px", borderRadius: "8px" },
                  },
                },
              }}
            />

            <DatePicker
              label="To"
              value={endDate ? dayjs(endDate) : null}
              onChange={(val) => onEndDateChange(val ? val.toDate() : null)}
              format="DD/MM/YYYY"
              minDate={startDate ? dayjs(startDate) : undefined}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    minWidth: 140,
                    "& .MuiInputBase-root": { height: 40, fontSize: "13px", borderRadius: "8px" },
                  },
                },
              }}
            />

            <Tooltip title="Clear all filters">
              <Button
                variant="outlined"
                color="inherit"
                onClick={onClear}
                startIcon={<X size={16} />}
                sx={{
                  height: 40,
                  borderRadius: "8px",
                  fontSize: "13px",
                  textTransform: "none",
                  borderColor: "divider",
                  px: 2,
                  "&:hover": { bgcolor: "action.hover", borderColor: "text.primary" }
                }}
              >
                CLEAR
              </Button>
            </Tooltip>
          </Stack>

          {/* ACTION DROPDOWN (Right Side) */}
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
            <Button
              id="action-button"
              aria-controls={open ? "action-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              variant="contained"
              disableElevation
              onClick={handleActionClick}
              endIcon={<ChevronDown size={18} />}
              sx={{
                bgcolor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
                borderRadius: 0,
                clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
                fontWeight: 700,
                fontSize: 14,
                height: 40,
                px: 3,
                textTransform: "none",
                letterSpacing: "0.5px",
                "&:hover": {
                  bgcolor: (theme) => theme.palette.primary.dark,
                  boxShadow: "0 6px 15px rgba(255, 215, 0, 0.3)",
                },
              }}
            >
              ACTIONS
            </Button>
            <Menu
              id="action-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleActionClose}
              MenuListProps={{
                "aria-labelledby": "action-button",
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                sx: {
                  mt: 0.5,
                  borderRadius: "12px",
                  minWidth: 200,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  "& .MuiMenuItem-root": {
                    py: 1.5,
                    px: 2.5,
                    fontSize: "14px",
                    fontWeight: 500,
                    gap: 2,
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "primary.light",
                      color: "primary.contrastText",
                      "& .lucide": { color: "inherit" }
                    },
                    "& .lucide": {
                      color: "text.secondary",
                      transition: "color 0.2s"
                    }
                  }
                }
              }}
            >
              <MenuItem onClick={() => { onCreate(); handleActionClose(); }}>
                <Plus size={18} color="#000033"/> CREATE ORDER
              </MenuItem>
              <MenuItem onClick={() => { onDownload(); handleActionClose(); }}>
                <FileSpreadsheet size={18} color="#2e7d32" /> EXCEL TEMPLATE
              </MenuItem>
              <MenuItem onClick={() => { onBulkUpload(); handleActionClose(); }}>
                <UploadCloud size={18} color="#0288d1" /> BULK UPLOAD
              </MenuItem>
            </Menu>
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={onFileChange}
            hidden
          />
        </Box>
      </motion.div>
    </LocalizationProvider>
  );
}
