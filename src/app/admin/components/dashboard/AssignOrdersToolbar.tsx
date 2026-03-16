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
  Typography,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ListIcon from "@mui/icons-material/List";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import FastForwardOutlinedIcon from "@mui/icons-material/FastForwardOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { LookupRow } from "@/app/admin/components/types/admin";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import { TextField } from "@mui/material";

const STATUS_OPTIONS = ["None", "R105", "W105"];

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
  assignableUsers?: { id: number; name: string }[];
  onAssignUser?: (userId: string, priority?: string) => Promise<void>;
  onSkipStage?: (val: string) => Promise<void>;
  onImportERPData?: () => void;
  onDownloadErpData?: () => void;
  onExcelExport?: () => void;
  onExcelImport?: () => void;
  statusCounts?: {
    R105: number;
    W105: number;
  };
  onUpdatePriority?: (val: string) => Promise<void>;
  customerFilter: string;
  onCustomerFilterChange: (val: string) => void;
  customers?: { id: number; name: string }[];
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
  assignableUsers = [],
  onAssignUser,
  onSkipStage,
  onImportERPData,
  onDownloadErpData,
  onExcelExport,
  onExcelImport,
  statusCounts = { R105: 0, W105: 0 },
  customerFilter,
  onCustomerFilterChange,
  customers = [],
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [tempAssignUser, setTempAssignUser] = useState<string>("placeholder");

  const [skipStageDialogOpen, setSkipStageDialogOpen] = useState(false);
  const [tempSkipStage, setTempSkipStage] = useState<string>("yes");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const [assignPriority, setAssignPriority] = useState<string>("");

  const handleActionClick = (action: () => void) => {
    if (selectedIds.length === 0) {
      setSnackbarOpen(true);
      handleMenuClose();
      return;
    }
    action();
    handleMenuClose();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAssignChange = async (e: any) => {
    const val = e.target.value;
    if (val !== "placeholder" && onAssignUser) {
      await onAssignUser(val);
    }
  };

  const handleSkipChange = async (e: any) => {
    const val = e.target.value;
    if (val !== "placeholder" && onSkipStage) {
      await onSkipStage(val);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          width: "100%",
          mt: 1,
          px: { xs: 1, sm: 2 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Main Floating Toolbar */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            bgcolor: "background.paper",
            width: "100%",
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: { xs: "stretch", lg: "center" },
            gap: 2,
            px: { xs: 1.5, sm: 2 },
            py: 1.5,
          }}
        >
          {/* Filters Group */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              alignItems: "center",
              flex: 1,
            }}
          >
            {/* Search Field */}
            <Box
              component="form"
              onSubmit={(e: React.FormEvent) => e.preventDefault()}
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", md: 160, lg: 180 },
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
                sx={{ ml: 1, flex: 1, fontSize: "13px" }}
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
                  <ClearIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
              <SearchIcon
                sx={{ color: "text.secondary", ml: 1, fontSize: 20 }}
              />
            </Box>

            {/* Payment Filter */}
            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "calc(50% - 8px)", sm: 85 },
                flex: { xs: 1, sm: "initial" },
              }}
            >
              <Select
                value={paymentFilter}
                displayEmpty
                onChange={(e) => onPaymentFilterChange(e.target.value)}
                sx={{ height: 40, fontSize: "13px" }}
              >
                <MenuItem value="">PAYMENT</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>

            {/* Zone Filter */}
            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "calc(50% - 8px)", sm: 90 },
                flex: { xs: 1, sm: "initial" },
              }}
            >
              <Select
                value={zoneFilter}
                displayEmpty
                onChange={(e) => onZoneFilterChange(e.target.value)}
                sx={{ height: 40, fontSize: "13px" }}
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
            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "calc(50% - 8px)", sm: 85 },
                flex: { xs: 1, sm: "initial" },
              }}
            >
              <Select
                value={statusFilter}
                displayEmpty
                onChange={(e) => onStatusFilterChange(e.target.value)}
                sx={{ height: 40, fontSize: "13px" }}
              >
                <MenuItem value="">STATUS</MenuItem>
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Customer Filter */}
            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "calc(50% - 8px)", sm: 120 },
                flex: { xs: 1, sm: "initial" },
              }}
            >
              <Select
                value={customerFilter}
                displayEmpty
                onChange={(e) => onCustomerFilterChange(e.target.value)}
                sx={{ height: 40, fontSize: "13px" }}
              >
                <MenuItem value="">CUSTOMER</MenuItem>
                {customers.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Date Pickers */}
            <DatePicker
              label="FROM"
              value={startDate ? dayjs(startDate) : null}
              onChange={(val) => onStartDateChange(val ? val.toDate() : null)}
              format="DD-MM-YYYY"
              slotProps={{
                field: {
                  clearable: true,
                  onClear: () => onStartDateChange(null),
                },
                textField: {
                  size: "small",
                  sx: {
                    width: { xs: "100%", sm: 210 },
                    flexShrink: 0,
                    "& .MuiInputBase-root": { height: 40, fontSize: "14px" },
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
                field: {
                  clearable: true,
                  onClear: () => onEndDateChange(null),
                },
                textField: {
                  size: "small",
                  sx: {
                    width: { xs: "100%", sm: 210 },
                    flexShrink: 0,
                    "& .MuiInputBase-root": { height: 40, fontSize: "14px" },
                    "& .MuiInputLabel-root": { fontSize: "13px" },
                  },
                },
              }}
            />

            {/* Clear Button */}
            <IconButton
              onClick={onClear}
              title="Clear Filters"
              sx={{
                color: "text.secondary",
                "&:hover": { color: "error.main" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            {/* Hamburger Menu Actions Dropdown */}
            <IconButton
              onClick={handleMenuOpen}
              sx={{ ml: 0.5 }}
              aria-controls={open ? "actions-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <ListIcon />
            </IconButton>
          </Box>

          {/* Status & Menu Group */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
              justifyContent: { xs: "center", lg: "flex-end" },
              borderTop: { xs: 1, lg: 0 },
              borderColor: "divider",
              pt: { xs: 1.5, lg: 0 },
            }}
          >
            {/* Status Count Cards */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {[
                {
                  label: "R105",
                  count: statusCounts.R105,
                  color: "#1976d2", // Blue
                  bgcolor: "#f0f7ff",
                  border: "#e1effe",
                  icon: <PersonOutlineIcon sx={{ fontSize: 22 }} />,
                },
                {
                  label: "W105",
                  count: statusCounts.W105,
                  color: "#ed6c02", // Orange
                  bgcolor: "#fffaf0",
                  border: "#fef3c7",
                  icon: <Inventory2OutlinedIcon sx={{ fontSize: 20 }} />,
                },
              ].map((card) => (
                <Box
                  key={card.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    px: 2,
                    py: 1,
                    borderRadius: "32px",
                    bgcolor: card.bgcolor,
                    border: "1px solid",
                    borderColor: card.border,
                  }}
                >
                  <Box sx={{ color: card.color, display: "flex" }}>
                    {card.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: card.color,
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {card.label}: {card.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>

        <Menu
          id="actions-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 240,
              borderRadius: "8px",
              overflow: "hidden",
              "& .MuiMenuItem-root": {
                px: 2.5,
                py: 1.5,
                gap: 1.5,
                transition: "background-color 0.2s ease",
              },
              "& .MuiListItemIcon-root": {
                minWidth: "auto",
              },
            },
          }}
        >
          {/* General Actions */}
          <MenuItem
            onClick={() => {
              onExcelExport?.();
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <FileDownloadOutlinedIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText
              primary="EXCEL EXPORT"
              primaryTypographyProps={{ fontSize: "14px", fontWeight: 500 }}
            />
          </MenuItem>

          <MenuItem
            onClick={() => {
              onExcelImport?.();
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <FileUploadOutlinedIcon fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText
              primary="EXCEL IMPORT"
              primaryTypographyProps={{ fontSize: "14px", fontWeight: 500 }}
            />
          </MenuItem>

          {/* Highlighted Banner for Selected Count (Only renders when items are actually selected) */}
          {selectedIds.length > 0 && (
            <Box
              sx={{
                px: 2.5,
                py: 1.2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                bgcolor: "#fff8e1",
                color: "#ed6c02",
                borderTop: "1px solid #eeeeee",
                borderBottom: "1px solid #eeeeee",
              }}
            >
              <CheckBoxOutlinedIcon fontSize="small" />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {selectedIds.length} Order{selectedIds.length > 1 ? "s" : ""}{" "}
                Selected
              </Typography>
            </Box>
          )}

          <MenuItem
            onClick={() =>
              handleActionClick(() => {
                onDownloadErpData?.();
              })
            }
          >
            <ListItemIcon>
              <FileDownloadOutlinedIcon fontSize="small" sx={{ color: "#2e7d32" }} />
            </ListItemIcon>
            <ListItemText
              primary="DOWNLOAD ERP DATA"
              primaryTypographyProps={{ fontSize: "14px", fontWeight: 500 }}
            />
          </MenuItem>

          {/* Actions requiring selection - Now always visible */}
          <MenuItem
            onClick={() =>
              handleActionClick(() => {
                onImportERPData?.();
              })
            }
          >
            <ListItemIcon>
              <StorageOutlinedIcon fontSize="small" sx={{ color: "#ed6c02" }} />
            </ListItemIcon>
            <ListItemText
              primary="IMPORT ERP DATA"
              primaryTypographyProps={{ fontSize: "14px", fontWeight: 500 }}
            />
          </MenuItem>

          <MenuItem
            onClick={() => handleActionClick(() => setAssignDialogOpen(true))}
          >
            <ListItemIcon>
              <PersonAddOutlinedIcon fontSize="small" color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="ASSIGN USER"
              primaryTypographyProps={{ fontSize: "14px", fontWeight: 500 }}
            />
          </MenuItem>

          <MenuItem
            onClick={() =>
              handleActionClick(() => setSkipStageDialogOpen(true))
            }
          >
            <ListItemIcon>
              <FastForwardOutlinedIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="SKIP STAGE"
              primaryTypographyProps={{ fontSize: "14px", fontWeight: 500 }}
            />
          </MenuItem>
        </Menu>
        <Dialog
          open={assignDialogOpen}
          onClose={() => {
            setAssignDialogOpen(false);
            setTempAssignUser("placeholder");
            setAssignPriority("");
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontSize: "16px", fontWeight: 600 }}>
            ASSIGN USER & PRIORITY
          </DialogTitle>
          <DialogContent>
            <FormControl size="small" fullWidth sx={{ mt: 1, mb: 2 }}>
              <Select
                value={tempAssignUser}
                displayEmpty
                onChange={(e) => setTempAssignUser(e.target.value)}
                sx={{ fontSize: "14px" }}
              >
                <MenuItem value="placeholder" disabled>
                  SELECT USER
                </MenuItem>
                <MenuItem value="unassign">UNASSIGNED</MenuItem>
                {assignableUsers.map((u: any) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Set Bulk Priority (Optional):
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              placeholder="e.g. 1 (Leave blank to keep existing)"
              value={assignPriority}
              onChange={(e) => setAssignPriority(e.target.value)}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => {
                setAssignDialogOpen(false);
                setTempAssignUser("placeholder");
                setAssignPriority("");
              }}
              color="inherit"
            >
              CANCEL
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={async () => {
                if (tempAssignUser !== "placeholder" && onAssignUser) {
                  await onAssignUser(tempAssignUser, assignPriority);
                }
                setAssignDialogOpen(false);
                setTempAssignUser("placeholder");
                setAssignPriority("");
              }}
              sx={{
                bgcolor: "#facd02",
                color: "#000",
                "&:hover": { bgcolor: "#e5bb01" },
              }}
            >
              SUBMIT
            </Button>
          </DialogActions>
        </Dialog>

        {/* Skip Stage Dialog */}
        <Dialog
          open={skipStageDialogOpen}
          onClose={() => {
            setSkipStageDialogOpen(false);
            setTempSkipStage("yes");
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontSize: "16px", fontWeight: 600 }}>
            SKIP STAGE
          </DialogTitle>
          <DialogContent>
            <FormControl size="small" fullWidth sx={{ mt: 1 }}>
              <Select
                value={tempSkipStage}
                displayEmpty
                onChange={(e) => setTempSkipStage(e.target.value)}
                sx={{ fontSize: "14px" }}
              >
                <MenuItem value="placeholder" disabled>
                  SELECT OPTION
                </MenuItem>
                <MenuItem value="yes">YES</MenuItem>
                <MenuItem value="no">NO</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => {
                setSkipStageDialogOpen(false);
                setTempSkipStage("yes");
              }}
              color="inherit"
            >
              CANCEL
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={async () => {
                if (tempSkipStage !== "placeholder" && onSkipStage) {
                  await onSkipStage(tempSkipStage);
                }
                setSkipStageDialogOpen(false);
                setTempSkipStage("yes");
              }}
              sx={{
                bgcolor: "#facd02",
                color: "#000",
                "&:hover": { bgcolor: "#e5bb01" },
              }}
            >
              SUBMIT
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="info"
            sx={{ width: "100%" }}
          >
            Please select Order(s)
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}
