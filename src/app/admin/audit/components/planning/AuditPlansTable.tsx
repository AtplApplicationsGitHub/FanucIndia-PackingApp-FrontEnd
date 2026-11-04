"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  alpha,
  Box,
  Button,
  Chip,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Link as MuiLink,
  useTheme,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { AuditStatusCounts } from "../../hooks/useAuditCounts";
import { formatDateIST } from "@/common/utils/dateTime";
import { useAuditList } from "../../hooks/useAuditList";
import { useAuditOperators } from "../../hooks/useAuditOperators";
import { useDeleteAudit } from "../../hooks/useDeleteAudit";
import { useReassignAudit } from "../../hooks/useReassignAudit";
import { AUDIT_LABELS } from "../../utils/auditLabels";
import { auditStatusColor } from "../../utils/auditStatus";
import {
  notifyAuditsUpdated,
  showGlobalMessage,
} from "../../utils/auditEvents";
import { auditViewRoute } from "../../utils/auditRoutes";
import type {
  AuditListRow,
  AuditOperator,
  AuditStatus,
  AuditType,
} from "../../types/audit";
import AssignedToCell from "./AssignedToCell";
import DeleteAuditDialog from "./DeleteAuditDialog";
import AuditLocationsDialog from "../shared/AuditLocationsDialog";
import AuditStatusPill from "../shared/AuditStatusPill";
import { Tooltip } from "@mui/material";

// Displays the uploaded file name
const sourceFile = (row: AuditListRow) =>
  String(row.details.fileName ?? row.details.stockFileName ?? "-");

const STATUS_BADGES: {
  status: AuditStatus | "ALL";
  label: string;
  color: "primary" | "warning" | "info" | "secondary" | "success";
}[] = [
  {
    status: "ALL",
    label: "All",
    color: "primary",
  },
  {
    status: "ASSIGNED",
    label: "Assigned",
    color: "warning",
  },
  {
    status: "IN_PROGRESS",
    label: "In Progress",
    color: "info",
  },
  {
    status: "RECONCILIATION_PENDING",
    label: "Reconciliation",
    color: "secondary",
  },
  {
    status: "CLOSED",
    label: "Closed",
    color: "success",
  },
];
type Props = {
  auditType: AuditType;
  statusCounts: AuditStatusCounts;
};

export default function AuditPlansTable({ auditType }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const label = AUDIT_LABELS[auditType];

  const { audits, pagination, params, loading, available, updateParams, statusCounts } =
    useAuditList(auditType);

  const { deleteAudit, loading: deleting } = useDeleteAudit(auditType);
  const { reassignAudit } = useReassignAudit(auditType);

  const { operators, loading: operatorsLoading } = useAuditOperators(
    audits.some((a) => a.actions.canReassign),
  );
  const [searchInput, setSearchInput] = useState(params.search);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuAudit, setMenuAudit] = useState<AuditListRow | null>(null);
  const [locAudit, setLocAudit] = useState<AuditListRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AuditListRow | null>(null);
  const [locOpen, setLocOpen] = useState(false);
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuAudit(null);
  };

  // Same rule as the "View" menu item: only these types have a view page
  const viewAvailable = auditType === "bom" || auditType === "cycle_count";

  const headCellSx = {
    fontWeight: 700,
    color: theme.palette.primary.contrastText,
    whiteSpace: "nowrap" as const,
  };

  // Deletes the audit
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      showGlobalMessage(await deleteAudit(deleteTarget.id), "success");
    } catch (error) {
      showGlobalMessage(
        error instanceof Error ? error.message : "Failed to delete audit.",
        "error",
      );
    } finally {
      // refresh in both cases (the list may be stale, e.g. already deleted)
      notifyAuditsUpdated();
      setDeleteTarget(null);
    }
  };
  // Function to Ressign the audit
  const handleReassign = async (
    audit: AuditListRow,
    operator: AuditOperator,
  ) => {
    try {
      showGlobalMessage(await reassignAudit(audit.id, operator.id), "success");
    } catch (error) {
      showGlobalMessage(
        error instanceof Error ? error.message : "Failed to reassign audit.",
        "error",
      );
    } finally {
      notifyAuditsUpdated();
    }
  };

  const emptyText = !available
    ? `${label} audits are not available yet.`
    : loading
      ? "Loading audits..."
      : `No audits found.`;

  return (
    <Box sx={{ mt: 1, width: "100%" }}>
      <Box
        sx={{
          mt: 2,
          width: "100%",
          bgcolor: "background.paper",
          px: 0,
          py: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            p: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                updateParams({
                  search: searchInput.trim().replace(/\s+/g, " "),
                  page: 1,
                });
              }}
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", sm: 230 },
                border: 1,
                borderColor: (t) =>
                  t.palette.mode === "dark"
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
                inputProps={{ "aria-label": "search audits" }}
                value={searchInput}
                disabled={!available}
                onChange={(e) => setSearchInput(e.target.value)}
              />

              {searchInput && (
                <IconButton
                  sx={{ p: "5px" }}
                  aria-label="clear search"
                  onClick={() => {
                    setSearchInput("");
                    updateParams({ search: "", page: 1 });
                  }}
                >
                  <ClearIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}

              <IconButton
                type="submit"
                sx={{ p: "5px" }}
                aria-label="search"
                disabled={!available}
              >
                <SearchIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {/* FROM DATE */}
              <DatePicker
                label="FROM"
                value={params.fromDate ? dayjs(params.fromDate) : null}
                onChange={(value) => {
                  if (value === null || value.isValid()) {
                    updateParams({
                      fromDate: value ? value.format("YYYY-MM-DD") : "",
                      page: 1,
                    });
                  }
                }}
                format="DD-MM-YYYY"
                maxDate={params.toDate ? dayjs(params.toDate) : undefined}
                disabled={!available}
                slotProps={{
                  field: {
                    clearable: true,
                    onClear: () =>
                      updateParams({
                        fromDate: "",
                        page: 1,
                      }),
                  },
                  textField: {
                    size: "small",
                    variant: "outlined",
                    sx: {
                      minWidth: 180,
                      width: 185,
                      bgcolor: "background.paper",
                    },
                  },
                }}
              />

              {/* TO DATE */}
              <DatePicker
                label="TO"
                value={params.toDate ? dayjs(params.toDate) : null}
                onChange={(value) => {
                  if (value === null || value.isValid()) {
                    updateParams({
                      toDate: value ? value.format("YYYY-MM-DD") : "",
                      page: 1,
                    });
                  }
                }}
                format="DD-MM-YYYY"
                minDate={params.fromDate ? dayjs(params.fromDate) : undefined}
                disabled={!available}
                slotProps={{
                  field: {
                    clearable: true,
                    onClear: () =>
                      updateParams({
                        toDate: "",
                        page: 1,
                      }),
                  },
                  textField: {
                    size: "small",
                    variant: "outlined",
                    sx: {
                      minWidth: 180,
                      width: 185,
                      bgcolor: "background.paper",
                    },
                  },
                }}
              />
              {/* CLEAR BOTH DATES */}
              {(params.fromDate || params.toDate) && (
                <Tooltip title="Clear Filter" arrow>
                  <IconButton
                    aria-label="Clear Filter"
                    size="small"
                    onClick={() =>
                      updateParams({ fromDate: "", toDate: "", page: 1 })
                    }
                    sx={{
                      color: "text.primary",
                      bgcolor: "transparent",
                      "&:hover": {
                        color: "error.main",
                        bgcolor: "action.hover",
                      },
                      "&:active": {
                        color: "text.primary",
                      },
                    }}
                  >
                    <ClearIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              )}
            </LocalizationProvider>
          </Box>
          {/* STATUS BADGES - RIGHT SIDE */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "flex-end",
              ml: "auto",
            }}
          >
            {STATUS_BADGES.map((item) => {
              const selected = params.status === item.status;
              const count =
                item.status === "ALL"
                  ? Object.values(statusCounts).reduce((sum, n) => sum + n, 0)
                  : statusCounts[item.status];

              return (
                <Chip
                  key={item.status}
                  label={`${item.label} (${count})`}
                  color={item.status === "ALL" ? undefined : item.color}
                  variant={selected ? "filled" : "outlined"}
                  clickable
                  disabled={!available}
                  onClick={() =>
                    updateParams({
                      status: item.status,
                      page: 1,
                    })
                  }
                  sx={{
                    fontWeight: selected ? 700 : 500,
                    cursor: "pointer",

                    ...(item.status === "ALL" && {
                      bgcolor: selected ? "#D4A017" : "transparent",
                      color: selected ? "#FFFFFF" : "#9A7100",
                      borderColor: "#D4A017",
                      "&:hover": {
                        bgcolor: selected ? "#BE8D12" : "#FFF3CD",
                      },
                    }),
                  }}
                />
              );
            })}
          </Box>
        </Box>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 0 }}
        >
          <Table
            sx={{
              minWidth: 650,
              "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                backgroundColor: alpha(theme.palette.primary.main, 0.25),
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
                bgcolor: theme.palette.primary.main,
              }}
            >
              <TableRow sx={{ height: 50 }}>
                <TableCell sx={headCellSx}>ACTIONS</TableCell>
                <TableCell sx={headCellSx}>AUDIT ID</TableCell>
                <TableCell sx={headCellSx}>AUDIT NAME</TableCell>
                <TableCell sx={headCellSx}>TYPE</TableCell>
                <TableCell sx={headCellSx}>ASSIGNED TO</TableCell>
                <TableCell sx={headCellSx}>LOCATION</TableCell>
                <TableCell sx={headCellSx}>CREATED ON</TableCell>
                <TableCell sx={headCellSx}>SOURCE FILE</TableCell>
                <TableCell sx={headCellSx}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {audits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {emptyText}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                audits.map((audit) => (
                  <TableRow key={`${audit.auditType}-${audit.id}`}>
                    <TableCell sx={{ width: "1%" }}>
                      <IconButton
                        size="small"
                        aria-label={`Actions for ${audit.auditName}`}
                        onClick={(e) => {
                          setMenuAnchor(e.currentTarget);
                          setMenuAudit(audit);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <MuiLink
                        component="button"
                        variant="body2"
                        onClick={() =>
                          router.push(auditViewRoute(audit.id, auditType))
                        }
                        disabled={!viewAvailable}
                        aria-label={`Open ${audit.auditNo}`}
                        sx={{
                          fontWeight: 600,
                          cursor: "pointer",
                          "&:disabled": {
                            color: "text.primary",
                            cursor: "default",
                            textDecoration: "none",
                          },
                        }}
                      >
                        {audit.auditNo}
                      </MuiLink>
                    </TableCell>
                    <TableCell>{audit.auditName}</TableCell>
                    <TableCell>{label}</TableCell>
                    <TableCell>
                      <AssignedToCell
                        audit={audit}
                        operators={operators}
                        operatorsLoading={operatorsLoading}
                        onReassign={handleReassign}
                      />
                    </TableCell>
                    <TableCell>
                      <MuiLink
                        component="button"
                        variant="body2"
                        onClick={() => {
                          setLocAudit(audit);
                          setLocOpen(true);
                        }}
                        disabled={!audit.storageBinCount}
                        aria-label={`View locations of ${audit.auditName}`}
                        sx={{
                          fontWeight: 600,
                          cursor: "pointer",
                          "&:disabled": {
                            color: "text.disabled",
                            cursor: "default",
                            textDecoration: "none",
                          },
                        }}
                      >
                        {audit.storageBinCount}
                      </MuiLink>
                    </TableCell>

                    <TableCell>{formatDateIST(audit.createdAt)}</TableCell>
                    <TableCell>{sourceFile(audit)}</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "nowrap",
                        }}
                      >
                        <AuditStatusPill
                          label={audit.statusLabel}
                          color={auditStatusColor(audit.status)}
                        />

                        {audit.status === "IN_PROGRESS" &&
                          typeof audit.details.uploadedLocations ===
                            "number" && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontSize: "11px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {audit.details.uploadedLocations} /{" "}
                              {audit.storageBinCount} Uploaded
                            </Typography>
                          )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={pagination.total}
          rowsPerPage={params.limit}
          page={params.page - 1}
          onPageChange={(_, nextPage) => updateParams({ page: nextPage + 1 })}
          onRowsPerPageChange={(e) =>
            updateParams({ limit: parseInt(e.target.value, 10), page: 1 })
          }
        />
      </Box>

      <AuditLocationsDialog
        open={locOpen}
        title={`${locAudit?.auditNo ?? ""} - LOCATIONS`}
        locations={locAudit?.storageBins.map((b) => b.storageBin) ?? []}
        onClose={() => setLocOpen(false)}
      />

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        PaperProps={{
          sx: {
            minWidth: 110,
            "& .MuiMenuItem-root": {
              minHeight: 36,
              fontSize: "14px",
              px: 1.5,
              py: 0.5,
            },
          },
        }}
      >
        <MenuItem
          disabled={auditType !== "bom" && auditType !== "cycle_count"}
          onClick={() => {
            // View opens the reconciliation page (content depends on the audit status)
            if (menuAudit) router.push(auditViewRoute(menuAudit.id, auditType));
            closeMenu();
          }}
        >
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View
        </MenuItem>

        <MenuItem
          disabled={!menuAudit?.actions.canDelete}
          sx={{ color: "error.main" }}
          onClick={() => {
            setDeleteTarget(menuAudit);
            closeMenu();
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <DeleteAuditDialog
        open={Boolean(deleteTarget)}
        auditName={deleteTarget?.auditName}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
