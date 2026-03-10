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
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import { LookupRow } from "@/app/admin/components/types/admin";

const STATUS_OPTIONS = ["None", "R105", "W105", "F105"];

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
  onAssignUser?: (userId: string) => Promise<void>;
  onSkipStage?: (val: string) => Promise<void>;
  onImportERPData?: () => void;
  onExcelExport?: () => void;
  onExcelImport?: () => void;
  statusCounts?: {
    R105: number;
    W105: number;
    F105: number;
  };
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
  onExcelExport,
  onExcelImport,
  statusCounts = { R105: 0, W105: 0, F105: 0 },
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [tempAssignUser, setTempAssignUser] = useState<string>("placeholder");

  const [skipStageDialogOpen, setSkipStageDialogOpen] = useState(false);
  const [tempSkipStage, setTempSkipStage] = useState<string>("yes");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = () => setSnackbarOpen(false);

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
          px: 2,
          pb: 0,
          mb: 0,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Main Floating Toolbar */}
        <Paper
          elevation={2}
          sx={{
            mb: 0,
            borderRadius: 2,
            bgcolor: "background.paper",
            width: { xs: "100%", md: "fit-content" },
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            px: 2,
            py: 1.5,
            ml: 0,
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
              width: { xs: "100%", sm: 180 },
              border: 1,
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : '#e0e0e0',
              borderRadius: "4px",
              height: 40,
              bgcolor: "background.paper",
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
          </Box>

          {/* Payment Filter */}
          <FormControl
            size="small"
            sx={{ minWidth: 100, bgcolor: "background.paper" }}
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
            sx={{ minWidth: 110, bgcolor: "background.paper" }}
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
          <FormControl
            size="small"
            sx={{ minWidth: 100, bgcolor: "background.paper" }}
          >
            <Select
              value={statusFilter}
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
                variant: "outlined",
                sx: {
                  minWidth: 120,
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
            minDate={startDate ? dayjs(startDate) : undefined}
            slotProps={{
              field: { clearable: true, onClear: () => onEndDateChange(null) },
              textField: {
                size: "small",
                variant: "outlined",
                sx: {
                  minWidth: 120,
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

          {/* Hamburger Menu Actions Dropdown */}
          <IconButton
            onClick={handleMenuOpen}
            sx={{ ml: { xs: 0, md: "auto" } }}
            aria-controls={open ? "actions-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <ListIcon />
          </IconButton>
        </Paper>

        {/* Status Count Cards */}
        <Box
          sx={{
            display: "flex",
            gap: 2.5,
            alignItems: "center",
            flexWrap: { xs: "wrap", lg: "nowrap" },
            width: { xs: "100%", md: "auto" },
            justifyContent: { xs: "center", md: "flex-end" },
            ml: { md: 2 },
          }}
        >
          {[
            { 
              label: "R105", 
              count: statusCounts.R105, 
              color: "#60a5fa",
              lightColor: "rgba(96, 165, 250, 0.08)",
              icon: <HowToRegIcon />
            },
            { 
              label: "W105", 
              count: statusCounts.W105, 
              color: "#fbbf24",
              lightColor: "rgba(251, 191, 36, 0.08)",
              icon: <PendingActionsRoundedIcon />
            },
            { 
              label: "F105", 
              count: statusCounts.F105, 
              color: "#c084fc",
              lightColor: "rgba(192, 132, 252, 0.08)",
              icon: <CheckCircleRoundedIcon />
            },
          ].map((card) => (
            <Paper
              key={card.label}
              elevation={0}
              sx={{
                px: 2.2,
                py: 1.5,
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: 2,
                minWidth: 155,
                border: "1px solid",
                borderColor: "#f0f0f0",
                bgcolor: "#ffffff",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  bgcolor: card.lightColor,
                  color: card.color,
                  flexShrink: 0,
                }}
              >
                {React.cloneElement(card.icon as React.ReactElement<any>, { sx: { fontSize: 24 } })}
              </Box>
              
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "#5f6368",
                    display: "block",
                    textTransform: "uppercase",
                    fontSize: "0.72rem",
                    mb: 0.2,
                  }}
                >
                  {card.label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    color: "#1a1a1b",
                    lineHeight: 1,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {card.count}
                </Typography>
              </Box>

              {/* Bottom Accent Bar */}
              <Box 
                sx={{ 
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "50%",
                  height: "4px",
                  bgcolor: card.color,
                  borderRadius: "4px 4px 0 0",
                  opacity: 0.9,
                }} 
              />
            </Paper>
          ))}
        </Box>

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
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontSize: "16px", fontWeight: 600 }}>
            ASSIGN USER
          </DialogTitle>
          <DialogContent>
            <FormControl size="small" fullWidth sx={{ mt: 1 }}>
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
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => {
                setAssignDialogOpen(false);
                setTempAssignUser("placeholder");
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
                  await onAssignUser(tempAssignUser);
                }
                setAssignDialogOpen(false);
                setTempAssignUser("placeholder");
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
          autoHideDuration={3000}
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
