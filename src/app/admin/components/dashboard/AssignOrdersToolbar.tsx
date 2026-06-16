import React, { useState } from "react";
import {
  Box,
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
  CircularProgress,
  Tooltip,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ListIcon from "@mui/icons-material/List";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { LookupRow } from "@/app/admin/components/types/admin";
import { TextField } from "@mui/material";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";
import CommonButton from "@/common/components/CommonButton";
import { CalendarCheck } from "lucide-react";

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
  onAssignUser?: (
    userId?: string,
    priority?: string,
    issueUserId?: string,
    packingUserId?: string,
    skipIssue?: string,
    skipPacking?: string,
  ) => Promise<void>;
  onSkipStage?: (val: string) => Promise<void>;
  onImportERPData?: () => void;
  onDownloadErpData?: () => void;
  onExcelExport?: () => void;
  onExcelImport?: () => void;
  statusCounts?: {
    R105: number;
    W105: number;
    PendingImport?: number;
    ErpImportFailed?: number;
    ErpSuccessUpload?: number;
  };
  pendingImportFilter?: boolean;
  onPendingImportClick?: () => void;
  onUpdatePriority?: (val: string) => Promise<void>;
  customerFilter: string;
  onCustomerFilterChange: (val: string) => void;
  customers?: { id: number; name: string }[];
  binFilter: string;
  onBinFilterChange: (val: string) => void;
  onOpenSambaView?: () => void;
  onTodayClick?: () => void;
  failedImportFilter?: boolean;
  onFailedImportClick?: () => void;
  onDownloadFailedErpData?: () => void;
  successImportFilter?: boolean;
  onSuccessImportClick?: () => void;
  onBulkUpdateRequiredDate?: (
    date: Date | null,
    paymentClearance?: boolean | null,
  ) => Promise<void>;
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
  statusCounts = {
    R105: 0,
    W105: 0,
    PendingImport: 0,
    ErpImportFailed: 0,
    ErpSuccessUpload: 0,
  },
  failedImportFilter = false,
  onFailedImportClick,
  onDownloadFailedErpData,
  pendingImportFilter = false,
  onPendingImportClick,
  successImportFilter = false,
  onSuccessImportClick,
  customerFilter,
  onCustomerFilterChange,
  customers = [],
  binFilter,
  onBinFilterChange,
  onOpenSambaView,
  onTodayClick,
  onBulkUpdateRequiredDate,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Make the ERP status chips behave like a single-select group:
  // when one is clicked, automatically unselect the other active one(s).
  const handleFailedChipClick = () => {
    if (pendingImportFilter && onPendingImportClick) onPendingImportClick();
    if (successImportFilter && onSuccessImportClick) onSuccessImportClick();
    onFailedImportClick?.();
  };

  const handleSuccessChipClick = () => {
    if (pendingImportFilter && onPendingImportClick) onPendingImportClick();
    if (failedImportFilter && onFailedImportClick) onFailedImportClick();
    onSuccessImportClick?.();
  };

  const handlePendingChipClick = () => {
    if (failedImportFilter && onFailedImportClick) onFailedImportClick();
    if (successImportFilter && onSuccessImportClick) onSuccessImportClick();
    onPendingImportClick?.();
  };

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [tempIssueUser, setTempIssueUser] = useState<string>("placeholder");
  const [tempPackingUser, setTempPackingUser] = useState<string>("placeholder");

  const [tempSkipIssue, setTempSkipIssue] = useState<string>("none");
  const [tempSkipPacking, setTempSkipPacking] = useState<string>("none");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const [assignPriority, setAssignPriority] = useState<string>("");

  const [requiredDateDialogOpen, setRequiredDateDialogOpen] = useState(false);
  const [bulkRequiredDate, setBulkRequiredDate] = useState<Date | null>(null);
  const [bulkPaymentStatus, setBulkPaymentStatus] = useState<
    "" | "true" | "false"
  >("");

  const [localSearch, setLocalSearch] = useState(searchInput);
  React.useEffect(() => {
    setLocalSearch(searchInput);
  }, [searchInput]);

  const [sftpStatus, setSftpStatus] = useState<
    "UP" | "DOWN" | "UNKNOWN" | "LOADING"
  >("UNKNOWN");

  const handleCheckSambaStatus = async () => {
    setSftpStatus("LOADING");
    try {
      const res = await fetchWithAuth(API.ADMIN.SFTP_STATUS);
      const data = await res.json();
      setSftpStatus(data.status === "UP" ? "UP" : "DOWN");
    } catch (e) {
      setSftpStatus("DOWN");
    }
  };

  React.useEffect(() => {
    handleCheckSambaStatus();
  }, []);

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
      // NOTE: Here we preserve signature, but actual submit is from Dialog
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
              flexWrap: "nowrap",
              gap: 1.25,
              alignItems: "center",
              flex: 1,
              width: "100%",
              minWidth: 0,
            }}
          >
            {/* Menu & Search Container */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: { xs: "100%", lg: "auto" },
                flex: { lg: "0 1 260px" },
                minWidth: { lg: 220 },
                maxWidth: { lg: 280 },
              }}
            >
              <IconButton onClick={handleMenuOpen} title="Actions">
                <ListIcon />
              </IconButton>
              <Box
                component="form"
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  onSearchInputChange(localSearch);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  minWidth: 0,
                  p: "2px 4px",
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
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
                {localSearch && (
                  <IconButton
                    sx={{ p: "5px" }}
                    onClick={() => {
                      setLocalSearch("");
                      onSearchInputChange("");
                    }}
                  >
                    <ClearIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
                <IconButton type="submit" sx={{ p: "5px" }}>
                  <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Payment Filter */}
            <FormControl
              size="small"
              sx={{ width: { xs: "100%", sm: "calc(50% - 6px)", lg: 72 } }}
            >
              <Select
                value={paymentFilter}
                displayEmpty
                onChange={(e) => onPaymentFilterChange(e.target.value)}
                sx={{ height: 40, fontSize: "13px" }}
              >
                <MenuItem value="">PAY</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>

            {/* Zone Filter */}
            <FormControl
              size="small"
              sx={{ width: { xs: "100%", sm: "calc(50% - 6px)", lg: 84 } }}
            >
              <Select
                value={zoneFilter}
                displayEmpty
                onChange={(e) => onZoneFilterChange(e.target.value)}
                sx={{ height: 40, fontSize: "13px" }}
              >
                <MenuItem value="">ZONE</MenuItem>
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
              sx={{ width: { xs: "100%", sm: "calc(50% - 6px)", lg: 100 } }}
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
              sx={{ width: { xs: "100%", sm: "calc(50% - 6px)", lg: 122 } }}
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

            {/* BIN Filter */}
            <FormControl
              size="small"
              sx={{ width: { xs: "100%", sm: "calc(50% - 6px)", lg: 80 } }}
            >
              <Select
                value={binFilter}
                displayEmpty
                onChange={(e) => onBinFilterChange(e.target.value)}
                sx={{ height: 40, fontSize: "13px" }}
              >
                <MenuItem value="">BIN</MenuItem>
                <MenuItem value="0">0</MenuItem>
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2-3">2-3</MenuItem>
                <MenuItem value="4+">≥4</MenuItem>
              </Select>
            </FormControl>

            {/* Date Pickers */}
            <DatePicker
              label="FROM"
              value={startDate ? dayjs(startDate) : null}
              onChange={(val) => onStartDateChange(val ? val.toDate() : null)}
              format="DD-MM-YYYY"
              minDate={dayjs().subtract(3, "day")}
              slotProps={{
                field: {
                  clearable: true,
                  onClear: () => onStartDateChange(null),
                },
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: {
                    width: { xs: 140, sm: 150, md: 160, lg: 185 },
                    flex: "0 0 auto",
                    minWidth: 160,
                    "& .MuiInputBase-root": {
                      height: 40,
                      fontSize: "13px",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "12px",
                    },
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
                startDate ? dayjs(startDate) : dayjs().subtract(3, "day")
              }
              slotProps={{
                field: {
                  clearable: true,
                  onClear: () => onEndDateChange(null),
                },
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: {
                    width: { xs: 140, sm: 150, md: 160, lg: 185 },
                    flex: "0 0 auto",
                    minWidth: 160,
                    "& .MuiInputBase-root": {
                      height: 40,
                      fontSize: "13px",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "12px",
                    },
                  },
                },
              }}
            />

            {/* Today Button */}
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
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#000000" : "#000000",
                }}
              >
                <CalendarCheck size={16} />
              </IconButton>
            </Tooltip>

            {/* Clear Button */}
            <IconButton
              onClick={onClear}
              title="Clear Filters"
              sx={{
                color: "text.secondary",
                flex: "0 0 auto",
                "&:hover": { color: "error.main" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Status & Menu Group */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "nowrap",
              overflowX: "auto",
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
                flexWrap: "nowrap",
                overflowX: "auto",
                justifyContent: "center",
              }}
            >
              <Tooltip title="ERP Import Failed">
                <Box
                  onClick={handleFailedChipClick}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.7,
                    px: 1.9,
                    py: 1,
                    borderRadius: "32px",
                    bgcolor: failedImportFilter ? "#ffebee" : "#fff5f5",
                    border: "1px solid",
                    borderColor: failedImportFilter ? "#d32f2f" : "#ffcdd2",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": { bgcolor: "#ffebee" },
                  }}
                >
                  <Box sx={{ color: "#d32f2f", display: "flex" }}>
                    <WarningAmberOutlinedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#d32f2f",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {statusCounts.ErpImportFailed ?? 0}
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="ERP Import Success">
                <Box
                  onClick={handleSuccessChipClick}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.7,
                    px: 1.9,
                    py: 1,
                    borderRadius: "32px",
                    bgcolor: successImportFilter ? "#dcfce7" : "#f0fdf4",
                    border: "1px solid",
                    borderColor: successImportFilter ? "#16a34a" : "#bbf7d0",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": { bgcolor: "#dcfce7" },
                  }}
                >
                  <Box sx={{ color: "#16a34a", display: "flex" }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography
                    sx={{ fontWeight: 700, color: "#16a34a", fontSize: "14px" }}
                  >
                    {statusCounts.ErpSuccessUpload ?? 0}
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="ERP Import Pending">
                <Box
                  onClick={handlePendingChipClick}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.7,
                    px: 1.9,
                    py: 1,
                    borderRadius: "32px",
                    bgcolor: pendingImportFilter ? "#fff3e0" : "#fff8e1",
                    border: "1px solid",
                    borderColor: pendingImportFilter ? "#ff9800" : "#ffe0b2",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": { bgcolor: "#fff3e0" },
                  }}
                >
                  <Box sx={{ color: "#ed6c02", display: "flex" }}>
                    <ErrorOutlineIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#ed6c02",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {statusCounts.PendingImport ?? 0}
                  </Typography>
                </Box>
              </Tooltip>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Tooltip
                  title={
                    sftpStatus === "LOADING"
                      ? "Checking Server..."
                      : sftpStatus === "UP"
                        ? "Samba Connected (Click to view files)"
                        : sftpStatus === "DOWN"
                          ? "Samba Disconnected"
                          : "Check Samba Server Status"
                  }
                >
                  <span>
                    <IconButton
                      onClick={() => {
                        if (sftpStatus === "UP" && onOpenSambaView) {
                          onOpenSambaView();
                        } else {
                          handleCheckSambaStatus();
                        }
                      }}
                      disabled={sftpStatus === "LOADING"}
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor:
                          sftpStatus === "UP"
                            ? "success.main"
                            : sftpStatus === "DOWN"
                              ? "error.main"
                              : "transparent",
                        color:
                          sftpStatus === "UP" || sftpStatus === "DOWN"
                            ? "#ffffff"
                            : "text.secondary",
                        "&:hover": {
                          bgcolor:
                            sftpStatus === "UP"
                              ? "success.dark"
                              : sftpStatus === "DOWN"
                                ? "error.dark"
                                : "action.hover",
                        },
                      }}
                    >
                      {sftpStatus === "LOADING" ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : sftpStatus === "UP" ? (
                        <CheckCircleOutlineIcon fontSize="small" />
                      ) : sftpStatus === "DOWN" ? (
                        <ErrorOutlineIcon fontSize="small" />
                      ) : (
                        <StorageOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
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
          {/* NEW: Download Failed ERP Data Action */}
          {failedImportFilter && (
            <MenuItem
              onClick={() =>
                handleActionClick(() => {
                  onDownloadFailedErpData?.();
                })
              }
            >
              <ListItemIcon>
                <FileDownloadOutlinedIcon
                  fontSize="small"
                  sx={{ color: "#d32f2f" }} // Red color to indicate failed
                />
              </ListItemIcon>
              <ListItemText
                primary="DOWNLOAD FAILED ERP DATA"
                primaryTypographyProps={{ fontSize: "14px", fontWeight: 500 }}
              />
            </MenuItem>
          )}
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
              <FileDownloadOutlinedIcon
                fontSize="small"
                sx={{ color: "#2e7d32" }}
              />
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
              primary="BULK ACTIONS"
              primaryTypographyProps={{ fontSize: "14px", fontWeight: 500 }}
            />
          </MenuItem>

          <MenuItem
            onClick={() =>
              handleActionClick(() => setRequiredDateDialogOpen(true))
            }
          >
            <ListItemIcon>
              <CalendarCheck size={20} color="#1976d2" />
            </ListItemIcon>
            <ListItemText
              primary="REQUIRED DATE"
              primaryTypographyProps={{ fontSize: "14px", fontWeight: 500 }}
            />
          </MenuItem>
        </Menu>
        <Dialog
          open={assignDialogOpen}
          onClose={() => {
            setAssignDialogOpen(false);
            setTempIssueUser("placeholder");
            setTempPackingUser("placeholder");
            setTempSkipIssue("none");
            setTempSkipPacking("none");
            setAssignPriority("");
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: "background.paper",
              backgroundImage: "none",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              fontSize: 20,
              textAlign: "center",
              letterSpacing: 0,
              color: "secondary.main",
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            BULK ACTIONS
            <Typography
              component="span"
              sx={{
                fontSize: 16,
                fontWeight: 400,
                color: "text.secondary",
                ml: 1,
              }}
            >
              · {selectedIds.length}{" "}
              {selectedIds.length === 1 ? "order" : "orders"}
            </Typography>
            <IconButton
              onClick={() => {
                setAssignDialogOpen(false);
                setTempIssueUser("placeholder");
                setTempPackingUser("placeholder");
                setTempSkipIssue("none");
                setTempSkipPacking("none");
                setAssignPriority("");
              }}
              size="small"
              sx={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "text.secondary",
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent
            sx={{ bgcolor: "background.paper", pt: "16px !important" }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Assign User (Issue Stage)"
                  value={tempIssueUser}
                  onChange={(e) => setTempIssueUser(e.target.value)}
                  InputProps={{ sx: { fontSize: "14px" } }}
                  InputLabelProps={{ sx: { fontSize: "14px" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "4px",
                      height: 48,
                      "& fieldset": { borderColor: "divider" },
                      "&:hover fieldset": { borderColor: "text.secondary" },
                      "&.Mui-focused fieldset": { borderColor: "primary.main" },
                    },
                    "& .MuiInputLabel-root": { fontSize: "13px" },
                    "& .MuiSelect-select": { fontSize: "14px" },
                  }}
                >
                  <MenuItem value="placeholder" disabled>
                    Select User
                  </MenuItem>
                  <MenuItem value="unassign">UNASSIGNED</MenuItem>
                  {assignableUsers.map((u: any) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Assign User (Packing Stage)"
                  value={tempPackingUser}
                  onChange={(e) => setTempPackingUser(e.target.value)}
                  InputProps={{ sx: { fontSize: "14px" } }}
                  InputLabelProps={{ sx: { fontSize: "14px" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "4px",
                      height: 48,
                      "& fieldset": { borderColor: "divider" },
                      "&:hover fieldset": { borderColor: "text.secondary" },
                      "&.Mui-focused fieldset": { borderColor: "primary.main" },
                    },
                    "& .MuiInputLabel-root": { fontSize: "13px" },
                    "& .MuiSelect-select": { fontSize: "14px" },
                  }}
                >
                  <MenuItem value="placeholder" disabled>
                    Select User
                  </MenuItem>
                  <MenuItem value="unassign">UNASSIGNED</MenuItem>
                  {assignableUsers.map((u: any) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ display: "flex", gap: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Skip Issue Stage"
                  value={tempSkipIssue}
                  onChange={(e) => setTempSkipIssue(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "4px",
                      height: 48,
                      "& fieldset": { borderColor: "divider" },
                      "&:hover fieldset": { borderColor: "text.secondary" },
                      "&.Mui-focused fieldset": { borderColor: "primary.main" },
                    },
                    "& .MuiInputLabel-root": { fontSize: "13px" },
                    "& .MuiSelect-select": { fontSize: "14px" },
                  }}
                >
                  <MenuItem value="none" disabled>
                    Select Option
                  </MenuItem>{" "}
                  {/* Add this line */}
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                </TextField>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Skip Packing Stage"
                  value={tempSkipPacking}
                  onChange={(e) => setTempSkipPacking(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "4px",
                      height: 48,
                      "& fieldset": { borderColor: "divider" },
                      "&:hover fieldset": { borderColor: "text.secondary" },
                      "&.Mui-focused fieldset": { borderColor: "primary.main" },
                    },
                    "& .MuiInputLabel-root": { fontSize: "13px" },
                    "& .MuiSelect-select": { fontSize: "14px" },
                  }}
                >
                  <MenuItem value="none" disabled>
                    Select Option
                  </MenuItem>{" "}
                  {/* Add this line */}
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                </TextField>
              </Box>

              <TextField
                fullWidth
                size="medium"
                type="number"
                label="Set Bulk Priority (Optional)"
                placeholder="e.g. 1"
                value={assignPriority}
                onChange={(e) => setAssignPriority(e.target.value)}
                InputProps={{ sx: { fontSize: "14px" } }}
                InputLabelProps={{ shrink: true, sx: { fontSize: "14px" } }}
              />
            </Box>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <CommonButton
              variant="contained"
              disableElevation
              onClick={async () => {
                const issueVal =
                  tempIssueUser === "placeholder" ? undefined : tempIssueUser;
                const packingVal =
                  tempPackingUser === "placeholder"
                    ? undefined
                    : tempPackingUser;

                const skipIssueVal =
                  tempSkipIssue === "none" ? undefined : tempSkipIssue;
                const skipPackingVal =
                  tempSkipPacking === "none" ? undefined : tempSkipPacking;

                if (
                  onAssignUser &&
                  (issueVal ||
                    packingVal ||
                    assignPriority ||
                    skipIssueVal ||
                    skipPackingVal)
                ) {
                  await onAssignUser(
                    undefined,
                    assignPriority,
                    issueVal,
                    packingVal,
                    skipIssueVal,
                    skipPackingVal,
                  );
                }

                setAssignDialogOpen(false);
                setTempIssueUser("placeholder");
                setTempPackingUser("placeholder");
                setTempSkipIssue("none");
                setTempSkipPacking("none");
                setAssignPriority("");
              }}
            >
              SUBMIT
            </CommonButton>
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

      {/* Bulk Required Date Dialog */}
      <Dialog
        open={requiredDateDialogOpen}
        onClose={() => {
          setRequiredDateDialogOpen(false);
          setBulkRequiredDate(null);
          setBulkPaymentStatus("");
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            backgroundImage: "none",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 20,
            textAlign: "center",
            letterSpacing: 0,
            color: "secondary.main",
            p: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          BULK REQUIRED DATE
          <Typography
            component="span"
            sx={{
              fontSize: 16,
              fontWeight: 400,
              color: "text.secondary",
              ml: 1,
            }}
          >
            · {selectedIds.length}{" "}
            {selectedIds.length === 1 ? "order" : "orders"}
          </Typography>
          <IconButton
            onClick={() => {
              setRequiredDateDialogOpen(false);
              setBulkRequiredDate(null);
              setBulkPaymentStatus("");
            }}
            size="small"
            sx={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "text.secondary",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent
          sx={{ bgcolor: "background.paper", pt: "24px !important" }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <DatePicker
              label="Required Date"
              value={bulkRequiredDate ? dayjs(bulkRequiredDate) : null}
              onChange={(val) => setBulkRequiredDate(val ? val.toDate() : null)}
              format="DD-MM-YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "medium",
                  InputProps: { sx: { fontSize: "14px" } },
                },
              }}
            />

            <FormControl fullWidth size="medium">
              <Select
                value={bulkPaymentStatus}
                displayEmpty
                onChange={(e) =>
                  setBulkPaymentStatus(e.target.value as "" | "true" | "false")
                }
                sx={{ fontSize: "14px" }}
              >
                <MenuItem value="" sx={{ fontSize: "14px" }}>
                  Payment Status
                </MenuItem>
                <MenuItem value="true" sx={{ fontSize: "14px" }}>
                  Yes
                </MenuItem>
                <MenuItem value="false" sx={{ fontSize: "14px" }}>
                  No
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <CommonButton
            variant="contained"
            disableElevation
            disabled={!bulkRequiredDate && bulkPaymentStatus === ""}
            onClick={async () => {
              if (onBulkUpdateRequiredDate) {
                await onBulkUpdateRequiredDate(
                  bulkRequiredDate,
                  bulkPaymentStatus === ""
                    ? null
                    : bulkPaymentStatus === "true",
                );
              }
              setRequiredDateDialogOpen(false);
              setBulkRequiredDate(null);
              setBulkPaymentStatus("");
            }}
          >
            SUBMIT
          </CommonButton>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
