"use client";

import React, { useState, useEffect } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import ListIcon from "@mui/icons-material/List";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { Plus } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

const STATUS_OPTIONS = ["None", "R105", "W105", "F105", "Dispatched"];

type Props = {
  view?: "home" | "orders" | "dispatched";
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  onDownload: () => void;
  onDownloadBlank: () => void;
  onBulkUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  view,
  searchValue,
  onSearchChange,
  onCreate,
  onDownload,
  onDownloadBlank,
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [localSearch, setLocalSearch] = useState(searchValue);
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

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
        <Paper
          elevation={2}
          sx={{
            mb: 1,
            borderRadius: 2,
            bgcolor: "background.paper",
            width: "fit-content",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: { xs: 1, xl: 2 },
            px: { xs: 1, md: 2 },
            py: 1,
            mx: "auto",
          }}
        >
          <Box
            component="form"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              onSearchChange(localSearch);
            }}
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: 160, md: 200 },
              borderColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.23)"
                  : "#e0e0e0", borderRadius: "4px",
              height: 40,
              bgcolor: "background.paper",
              flexShrink: 1,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: "14px" }}
              placeholder="Search orders..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <IconButton
                sx={{ p: "5px" }}
                onClick={() => {
                  setLocalSearch("");
                  onSearchChange("");
                }}
              >
                <ClearIcon sx={{ fontSize: 20 }} />
              </IconButton>
            )}
            <IconButton type="submit" sx={{ p: "5px" }}>
              <SearchIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          <FormControl
            size="small"
            sx={{
              minWidth: { xs: 100, md: 110 },
              bgcolor: "background.paper",
              flexShrink: 1,
            }}
          >
            <Select
              value={paymentFilter}
              displayEmpty
              onChange={(e) => onPaymentFilterChange(e.target.value)}
              sx={{ height: 40, fontSize: "13px" }}
            >
              <MenuItem value="" sx={{ fontSize: "13px" }}>
                PAYMENT
              </MenuItem>
              <MenuItem value="true" sx={{ fontSize: "13px" }}>
                Yes
              </MenuItem>
              <MenuItem value="false" sx={{ fontSize: "13px" }}>
                No
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: { xs: 110, md: 120 },
              bgcolor: "background.paper",
              flexShrink: 1,
            }}
          >
            <Select
              value={zoneFilter}
              displayEmpty
              onChange={(e) => onZoneFilterChange(e.target.value)}
              sx={{ height: 40, fontSize: "13px" }}
            >
              <MenuItem value="" sx={{ fontSize: "13px" }}>
                SALES ZONE
              </MenuItem>
              {salesZones.map((zone) => (
                <MenuItem
                  key={zone.id}
                  value={String(zone.id)}
                  sx={{ fontSize: "13px" }}
                >
                  {zone.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: { xs: 100, md: 100 },
              bgcolor: "background.paper",
              flexShrink: 1,
            }}
          >
            <Select
              value={statusFilter}
              displayEmpty
              onChange={(e) => onStatusFilterChange(e.target.value)}
              sx={{ height: 40, fontSize: "13px" }}
            >
              <MenuItem value="" sx={{ fontSize: "13px" }}>
                STATUS
              </MenuItem>
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status} sx={{ fontSize: "13px" }}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DatePicker
            label="FROM"
            value={startDate ? dayjs(startDate) : null}
            onChange={(val) => onStartDateChange(val ? val.toDate() : null)}
            format="DD-MM-YYYY"
            slotProps={{
              textField: {
                size: "small",
                sx: {
                  minWidth: { xs: 120, md: 130 },
                  bgcolor: "background.paper",
                  "& .MuiInputBase-root": { height: 40, fontSize: "13px" },
                  "& .MuiInputLabel-root": { fontSize: "13px" },
                },
              },
            }}
          />
          <DatePicker
            label="TO"
            value={endDate ? dayjs(endDate) : null}
            onChange={(val) => onEndDateChange(val ? val.toDate() : null)}
            format="DD-MM-YYYY"
            minDate={startDate ? dayjs(startDate) : undefined}
            slotProps={{
              textField: {
                size: "small",
                sx: {
                  minWidth: { xs: 120, md: 130 },
                  bgcolor: "background.paper",
                  "& .MuiInputBase-root": { height: 40, fontSize: "13px" },
                  "& .MuiInputLabel-root": { fontSize: "13px" },
                },
              },
            }}
          />

          <IconButton
            onClick={onClear}
            sx={{
              color: "text.secondary",
              "&:hover": { color: "error.main", opacity: 0.8 },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {view !== "dispatched" && (
              <>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={onCreate}
                  startIcon={<Plus size={18} />}
                  sx={{
                    bgcolor: "#facd02",
                    color: "#000",
                    fontWeight: 600,
                    fontSize: "12px",
                    height: 40,
                    whiteSpace: "nowrap",
                    px: { xs: 1.5, md: 2 },
                    "&:hover": { bgcolor: "#e5bb01" },
                  }}
                >
                  CREATE ORDER
                </Button>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <ListIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Paper>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            elevation: 3,
            sx: { mt: 1.5, minWidth: 200, borderRadius: "8px" },
          }}
        >
          <MenuItem
            onClick={() => {
              onDownloadBlank();
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <FileDownloadOutlinedIcon
                fontSize="small"
                sx={{ color: "#ed6c02" }}
              />
            </ListItemIcon>
            <ListItemText primary="BLANK TEMPLATE" />
          </MenuItem>

          <MenuItem
            onClick={() => {
              onDownload();
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <FileDownloadOutlinedIcon
                fontSize="small"
                sx={{ color: "#2e7d32" }}
              />
            </ListItemIcon>
            <ListItemText primary="EXCEL TEMPLATE" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              onBulkUpload();
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <FileUploadOutlinedIcon
                fontSize="small"
                sx={{ color: "#0288d1" }}
              />
            </ListItemIcon>
            <ListItemText primary="BULK UPLOAD" />
          </MenuItem>
        </Menu>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={onFileChange}
          hidden
        />
      </Box>
    </LocalizationProvider>
  );
}
