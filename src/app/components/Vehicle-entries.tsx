import React, { useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Divider,
} from "@mui/material";
import { Close, Download, Visibility } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { type Dayjs } from "dayjs";
import {
  useVehicleEntries,
  useVehicleEntryAttachments,
  type VehicleEntry,
  type VehicleEntryAttachment,
  type VehicleEntryUser,
} from "@/app/components/hooks/Usevehicle-entries";
import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { secureDownload } from "@/common/lib/secure-download";

type VehicleEntriesProps = {
  onClose?: () => void;
};

const VEHICLE_ENTRY_COLUMNS = [
  "VEHICLE NUMBER",
  "TRANSPORTER",
  "CUSTOMER NAME",
  "DRIVER NUMBER",
  "CREATED USER",
  "STATUS",
  "CREATED DATE",
  "ATTACHMENTS",
];

const ATTACHMENT_COLUMNS = ["S.NO", "File Name", "Actions"];
const TABLE_HEADER_YELLOW = "#FFCC00";

const displayValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const getTodayDateValue = () => {
  const today = new Date();
  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60_000,
  );
  return localToday.toISOString().slice(0, 10);
};

const getUserName = (value?: string | number | VehicleEntryUser | null) => {
  if (!value) return "-";
  if (typeof value === "string" || typeof value === "number") {
    return String(value) || "-";
  }

  return (
    value.name ?? value.userName ?? value.username ?? value.fullName ?? "-"
  );
};

const formatCreatedDate = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
};

const getStatusChipSx = (status: string) => {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus.includes("pending")) {
    return {
      bgcolor: "#FEE2E2",
      color: "#B91C1C",
    };
  }

  if (normalizedStatus.includes("start")) {
    return {
      bgcolor: "#DCFCE7",
      color: "#166534",
    };
  }

  if (
    normalizedStatus.includes("complete") ||
    normalizedStatus.includes("approved")
  ) {
    return {
      bgcolor: "#DCFCE7",
      color: "#166534",
    };
  }

  if (
    normalizedStatus.includes("reject") ||
    normalizedStatus.includes("cancel")
  ) {
    return {
      bgcolor: "#FEE2E2",
      color: "#991B1B",
    };
  }

  return {
    bgcolor: "#E5E7EB",
    color: "#374151",
  };
};

const StatusChip = ({ status }: { status: string }) => {
  const chipSx = getStatusChipSx(status);

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3px 10px",
        borderRadius: "16px",
        border: "1px solid",
        borderColor: alpha(chipSx.color, 0.5),
        backgroundColor: chipSx.bgcolor,
        color: chipSx.color,
        fontSize: "0.75rem",
        fontWeight: 600,
        minWidth: "50px",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </Box>
  );
};

export default function VehicleEntries({ onClose }: VehicleEntriesProps) {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    getTodayDateValue,
  );
  const { rows, loading, error } = useVehicleEntries(selectedDate ?? undefined);
  const {
    attachments,
    loading: attachmentsLoading,
    error: attachmentsError,
    fetchAttachments,
    clearAttachments,
  } = useVehicleEntryAttachments();
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<VehicleEntry | null>(null);
  const [attachmentActionError, setAttachmentActionError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const visibleRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateChange = (value: Dayjs | null) => {
    const nextDate =
      value && value.isValid() ? value.format("YYYY-MM-DD") : null;
    setSelectedDate(nextDate);
    setPage(0);
  };

  const handleOpenAttachments = async (entry: VehicleEntry) => {
    setSelectedEntry(entry);
    setAttachmentActionError("");
    setAttachmentDialogOpen(true);
    await fetchAttachments(entry.id);
  };

  const handleCloseAttachments = () => {
    setAttachmentDialogOpen(false);
    setSelectedEntry(null);
    setAttachmentActionError("");
    clearAttachments();
  };

  const handleAttachmentAction = async (
    attachment: VehicleEntryAttachment,
    action: "view" | "download",
  ) => {
    if (!selectedEntry?.id) return;

    setAttachmentActionError("");

    try {
      const response = await fetchWithAuth(
        API.VEHICLE_ENTRY.DOWNLOAD_ATTACHMENT(
          selectedEntry.id,
          attachment.fileName,
        ),
      );
      if (!response.ok) throw new Error("Attachment request failed");

      const blob = await response.blob();

      if (action === "download") {
        secureDownload(blob, attachment.fileName);
        return;
      }

      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    } catch {
      setAttachmentActionError("Failed to open attachment");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 1. STANDARDIZED DIALOG TITLE */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            fontSize: "20px",
            color: "error.main",
            pb: 1,
            position: "relative",
          }}
        >
          VEHICLE ENTRIES
          {onClose ? (
            <IconButton
              aria-label="Close vehicle entries"
              onClick={onClose}
              size="small"
              sx={{
                position: "absolute",
                right: 12,
                color: "text.secondary", // FIX: "text.secondary" ensures the X is perfectly visible in Dark and Light mode
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          ) : null}
        </DialogTitle>
        <Divider />

        {/* 2. MAIN DIALOG CONTENT WRAPPER */}
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* 3. CLEAN FILTER BAR MOVED ABOVE TABLE */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <DatePicker
              label="DATE"
              value={selectedDate ? dayjs(selectedDate) : null}
              onChange={handleDateChange}
              format="DD-MM-YYYY"
              slotProps={{
                field: {
                  clearable: true,
                  onClear: () => handleDateChange(null),
                },
                textField: {
                  size: "small",
                  variant: "outlined",
                  sx: {
                    width: { xs: "100%", sm: 200 },
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
          </Box>

          {error ? (
            <Alert severity="error" sx={{ borderRadius: 1, mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          {loading && rows.length === 0 ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: 1, // Added slight border radius
                  width: "100%",
                  maxHeight: "65vh",
                  overflowX: "auto",
                  border: "1px solid",
                  borderColor: "divider", // Match standard table borders
                }}
              >
                <Table
                  stickyHeader
                  sx={{
                    minWidth: 650,
                    width: "100%",
                    "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                      backgroundColor: lightYellow,
                    },
                    "& .MuiTableBody-root .MuiTableRow-root:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    },
                    "& .MuiTableCell-root": {
                      borderBottom: "none",
                      py: 0.5,
                      px: 1,
                      fontSize: "0.875rem",
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <TableHead
                    sx={{
                      "& .MuiTableCell-head": {
                        bgcolor: TABLE_HEADER_YELLOW,
                        color: "#000000",
                      },
                    }}
                  >
                    <TableRow sx={{ height: 50 }}>
                      {VEHICLE_ENTRY_COLUMNS.map((label) => (
                        <TableCell
                          key={label}
                          align={label === "ATTACHMENTS" ? "center" : "left"}
                          sx={{
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={VEHICLE_ENTRY_COLUMNS.length}
                          align="center"
                          sx={{ py: 4 }}
                        >
                          <Typography color="text.secondary">
                            No vehicle entries found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleRows.map((entry) => {
                        const status = displayValue(
                          entry.dispatchStatus ?? entry.status,
                        );
                        const attachmentCount = entry.attachments?.length ?? 0;

                        return (
                          <TableRow
                            key={entry.id}
                            hover
                            sx={{
                              "&:last-child td": { borderBottom: 0 },
                            }}
                          >
                            <TableCell sx={{ fontWeight: 700 }}>
                              {displayValue(entry.vehicleNumber)}
                            </TableCell>
                            <TableCell>
                              {displayValue(entry.transporterName)}
                            </TableCell>
                            <TableCell>
                              {displayValue(entry.customerName)}
                            </TableCell>
                            <TableCell>
                              {displayValue(entry.driverNumber)}
                            </TableCell>
                            <TableCell>
                              {getUserName(
                                entry.createdUser ?? entry.createdBy,
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusChip status={status} />
                            </TableCell>
                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                              {formatCreatedDate(entry.createdAt)}
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip
                                title={`View attachments (${attachmentCount})`}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenAttachments(entry)}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              />
            </>
          )}
        </DialogContent>
      </Box>

      {/* Attachments Dialog (Leave as is) */}
      <Dialog
        open={attachmentDialogOpen}
        onClose={handleCloseAttachments}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 1,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            fontSize: "20px",
            color: "error.main",
            py: 2,
            position: "relative",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          VEHICLE ENTRY ATTACHMENTS
          <IconButton
            onClick={handleCloseAttachments}
            sx={{
              position: "absolute",
              right: 12,
              color: "text.secondary",
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pt: 3, pb: 3 }}>
          {attachmentsError || attachmentActionError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {attachmentsError || attachmentActionError}
            </Alert>
          ) : null}

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 1,
              width: "100%",
              overflowX: "auto",
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Table
              sx={{
                minWidth: 420,
                width: "100%",
                "& .MuiTableBody-root .MuiTableRow-root:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
                "& .MuiTableCell-root": {
                  borderBottom: "none",
                  py: 1.25,
                  px: 2,
                  fontSize: "0.875rem",
                  whiteSpace: "nowrap",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  {ATTACHMENT_COLUMNS.map((label) => (
                    <TableCell
                      key={label}
                      align={label === "ACTIONS" ? "center" : "left"}
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        width:
                          label === "S.NO"
                            ? 90
                            : label === "ACTIONS"
                              ? 140
                              : "auto",
                      }}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {attachmentsLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={ATTACHMENT_COLUMNS.length}
                      align="center"
                      sx={{ py: 4, bgcolor: lightYellow }}
                    >
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : attachments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={ATTACHMENT_COLUMNS.length}
                      align="center"
                      sx={{
                        py: 4,
                        bgcolor: lightYellow,
                        color: "text.secondary",
                        fontSize: "1rem",
                      }}
                    >
                      No attachments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  attachments.map((attachment, index) => (
                    <TableRow key={attachment.fileName}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{attachment.fileName}</TableCell>
                      <TableCell align="center" sx={{ width: 140 }}>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <Tooltip title="View attachment">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleAttachmentAction(attachment, "view")
                              }
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download attachment">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleAttachmentAction(attachment, "download")
                              }
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  );
}
