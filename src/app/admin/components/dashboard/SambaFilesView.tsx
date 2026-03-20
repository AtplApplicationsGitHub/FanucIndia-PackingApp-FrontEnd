"use client";
import React, { useState, useEffect, useMemo } from "react";
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
  Checkbox,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
  TextField,
  InputAdornment,
} from "@mui/material";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ListIcon from "@mui/icons-material/List";
import { RefreshCcw } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import { fetchWithAuth, API } from "../../../../common/lib/endpoints";

type FileRow = {
  id: number;
  filename: string;
  size: number;
  createdDatetime?: string;
};

const TABS = ["ACTIVE", "ARCHIVE", "ERROR", "LOGS"];

export default function SambaFilesView({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  });
  const [filesByTab, setFilesByTab] = useState<Record<string, FileRow[]>>({
    ACTIVE: [],
    ARCHIVE: [],
    ERROR: [],
    LOGS: [],
  });
  const [files, setFiles] = useState<FileRow[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [sftpStatus, setSftpStatus] = useState<
    "UP" | "DOWN" | "UNKNOWN" | "LOADING"
  >("UNKNOWN");

  // Menu State
  // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    handleCheckSambaStatus();
    fetchAllFiles();
  }, []);

  const fetchAllFiles = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        TABS.map((folder) =>
          fetchWithAuth(`${API.SAMBA.FILES}?folder=${folder}`)
            .then((res) => (res.ok ? res.json() : []))
            .catch(() => []),
        ),
      );
      const newFilesByTab: Record<string, FileRow[]> = {};
      TABS.forEach((tab, index) => {
        newFilesByTab[tab] = results[index];
      });
      setFilesByTab(newFilesByTab);
    } catch (error) {
      console.error("Failed to fetch files", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    setSelectedFiles([]);
    setPage(0);
  }, [activeTab]);

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

  useEffect(() => {
    fetchFiles(activeTab);
    setSelectedFiles([]);
    setSearch("");
    setPage(0);
  }, [activeTab]);

  const fetchFiles = async (folder: string) => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API.SAMBA.FILES}?folder=${folder}`);
      if (res.ok) setFiles(await res.json());
    } catch (error) {
      console.error("Failed to fetch files", error);
    }
    setLoading(false);
  };

  const handleDownload = async (filenames: string[]) => {
    if (filenames.length === 0) return;
    setDownloading(true);
    try {
      const response = await fetchWithAuth(API.SAMBA.DOWNLOAD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: activeTab, filenames }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const outName =
          filenames.length === 1 ? filenames[0] : `${activeTab}_FILES.zip`;
        
        const sanitizedOutName = outName.replace(/[^a-zA-Z0-9.\-_ ]/g, "_");
        link.setAttribute("download", sanitizedOutName);
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download failed", error);
    }
    setDownloading(false);
};

  const getTabCount = (tab: string) => {
    const tabFiles = filesByTab[tab] || [];
    return tabFiles.filter((f) => {
      if (selectedDate) {
        const fileDate = f.createdDatetime
          ? new Date(f.createdDatetime).toISOString().split("T")[0]
          : "";
        if (fileDate !== selectedDate) return false;
      }
      if (search && !f.filename.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    }).length;
  };

  const filteredFiles = useMemo(() => {
    const currentFiles = filesByTab[activeTab] || [];
    return currentFiles
      .filter((f) => {
        // 1. Date Filter
        if (selectedDate) {
          // FIX: Safely convert numeric timestamp to Date object before splitting
          const fileDate = f.createdDatetime
            ? new Date(f.createdDatetime).toISOString().split("T")[0]
            : "";
          if (fileDate !== selectedDate) return false;
        }
        // 2. Search Filter
        if (search && !f.filename.toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      })
      .sort((a, b) => {
        // 3. Ascending Order of Created Datetime
        const dateA = new Date(a.createdDatetime || 0).getTime();
        const dateB = new Date(b.createdDatetime || 0).getTime();
        return dateA - dateB;
      });
  }, [filesByTab, activeTab, search, selectedDate]);

  const paginatedFiles = filteredFiles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );
  const isAllSelected =
    paginatedFiles.length > 0 && selectedFiles.length === filteredFiles.length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(
      e.target.checked ? filteredFiles.map((f) => f.filename) : [],
    );
  };

  const handleSelectOne = (filename: string) => {
    setSelectedFiles((prev) =>
      prev.includes(filename)
        ? prev.filter((f) => f !== filename)
        : [...prev, filename],
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        mt: 1,
        px: 1,
        pb: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* 1. LOOKUP PANEL STYLE PILL HEADER */}
      <Paper
        elevation={2}
        sx={{
          mb: 2,
          borderRadius: 2,
          bgcolor: "background.paper",
          width: "fit-content",
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 1,
          py: 0.5,
          mx: "auto",
        }}
      >
        {/* LEFT: Back Button, Date Filter & Search */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Go Back">
            <IconButton onClick={onBack} color="primary" sx={{ ml: 0.5 }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          {/* NEW: MUI Desktop Date Picker Filter */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker
              format="DD-MM-YYYY"
              value={selectedDate ? dayjs(selectedDate) : null}
              onChange={(newDate) => {
                if (newDate && newDate.isValid()) {
                  setSelectedDate(newDate.format("YYYY-MM-DD"));
                } else {
                  setSelectedDate("");
                }
                setPage(0);
              }}
              slotProps={{
                field: {
                  clearable: true,
                  onClear: () => {
                    setSelectedDate("");
                    setPage(0);
                  },
                },
                textField: {
                  size: "small",
                  placeholder: "Select Date",
                  sx: {
                    width: { xs: "170px", sm: "200px" },
                    "& .MuiInputBase-root": { borderRadius: 1.5 },
                  },
                },
              }}
            />
          </LocalizationProvider>

          <TextField
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            sx={{ width: { xs: "150px", sm: "220px" } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { borderRadius: 1.5 },
            }}
          />
        </Box>

        {/* MIDDLE: TABS WITH COUNTS */}
        <Tabs
          value={activeTab}
          onChange={(_, newVal) => setActiveTab(newVal)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            // 1. Fix the Indicator line color
            "& .MuiTabs-indicator": {
              backgroundColor:
                theme.palette.mode === "light"
                  ? theme.palette.text.primary
                  : theme.palette.primary.main,
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: 14,
              minWidth: 80,
              px: 2,
              color: theme.palette.text.secondary,
              // 2. Fix the Selected text color
              "&.Mui-selected": {
                color:
                  theme.palette.mode === "light"
                    ? theme.palette.text.primary
                    : theme.palette.primary.main,
              },
            },
          }}
        >
          {TABS.map((tab) => {
            // 3. Keep Tabs capitalized
            const labelText = tab === "ARCHIVE" ? "ARCHIVED" : tab;
            return (
              <Tab
                key={tab}
                label={`${labelText} (${getTabCount(tab)})`}
                value={tab}
              />
            );
          })}
        </Tabs>

        {/* RIGHT: Status & Quick Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip
            title={
              sftpStatus === "LOADING"
                ? "Checking Server..."
                : sftpStatus === "UP"
                  ? "Samba Connected"
                  : sftpStatus === "DOWN"
                    ? "Samba Disconnected"
                    : "Check Samba Server Status"
            }
          >
            <IconButton
              onClick={handleCheckSambaStatus}
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
                <CircularProgress size={18} color="inherit" />
              ) : sftpStatus === "UP" ? (
                <CheckCircleOutlineIcon fontSize="small" />
              ) : sftpStatus === "DOWN" ? (
                <ErrorOutlineIcon fontSize="small" />
              ) : (
                <StorageOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          {/* NEW: Refresh Icon Button */}
          <Tooltip title="Refresh Files">
            <IconButton
              onClick={fetchAllFiles}
              sx={{
                color: theme.palette.mode === "dark" ? "#90caf9" : "#1976d2",
              }}
            >
              <RefreshCcw size={20} />
            </IconButton>
          </Tooltip>

          {/* NEW: Conditional ZIP Download Icon Button */}
          {selectedFiles.length > 0 && (
            <Tooltip title={`Download ZIP (${selectedFiles.length})`}>
              <IconButton
                onClick={() => handleDownload(selectedFiles)}
                disabled={downloading}
                color="warning"
              >
                {downloading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <FolderZipIcon />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Paper>

      {/* 3. CONTENT AREA */}
      <Box sx={{ width: "100%" }}>
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <TableContainer>
            <Table
              size="small"
              sx={{
                "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                  backgroundColor: lightYellow,
                },
                "& .MuiTableBody-root .MuiTableRow-root:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
                "& .MuiTableCell-root": {
                  borderBottom: "none",
                  py: 1,
                  px: 2,
                  fontSize: "0.875rem",
                },
              }}
            >
              <TableHead
                sx={{
                  bgcolor:
                    theme.palette.mode === "dark" ? "#000000" : "#ffffff",
                }}
              >
                <TableRow sx={{ height: 50 }}>
                  <TableCell padding="checkbox" align="center">
                    <Checkbox
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, width: "10%" }}
                  >
                    S.No
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, width: "45%" }}
                  >
                    Filename
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, width: "25%" }}
                  >
                    Created DateTime
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : paginatedFiles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 5, bgcolor: lightYellow }}
                    >
                      No files found in {activeTab}.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFiles.map((row, index) => (
                    <TableRow key={row.filename}>
                      <TableCell padding="checkbox" align="center">
                        <Checkbox
                          checked={selectedFiles.includes(row.filename)}
                          onChange={() => handleSelectOne(row.filename)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 500 }}>
                        {row.filename}
                      </TableCell>
                      <TableCell align="center">
                        {row.createdDatetime
                          ? new Date(row.createdDatetime).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Download File">
                          <IconButton
                            size="small"
                            onClick={() => handleDownload([row.filename])}
                            sx={{
                              color:
                                theme.palette.mode === "dark"
                                  ? "#90caf9"
                                  : "#1976d2",
                            }}
                          >
                            <FileDownloadOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredFiles.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
          />
        </Paper>
      </Box>
    </Box>
  );
}
