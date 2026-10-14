"use client";

import { useMemo, useState } from "react";

import {
  alpha,
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Tooltip,
} from "@mui/material";
import { Search } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useAuditPlans } from "../../hooks/useAuditPlans";
import { AUDIT_LABELS } from "../../mock/auditMockData";
import type { AuditPlan, AuditStatus, AuditType } from "../../types/audit";
import {
  STALE_AFTER_DAYS,
  formatAge,
  getAgeInDays,
} from "../../utils/auditAge";

import AuditExcelPreview from "./AuditExcelPreview";

export default function AuditPlansTable() {
  const theme = useTheme();
  const { plans, deletePlan } = useAuditPlans();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [auditType, setAuditType] = useState<AuditType | "all">("all");

  const [status, setStatus] = useState<AuditStatus | "All">("Assigned");
  const [selected, setSelected] = useState<AuditPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AuditPlan | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const headCellSx = {
    fontWeight: "bold",
    color: theme.palette.primary.contrastText,
  };

  const rows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return plans
      .filter((plan) => {
        const matchesSearch =
          !keyword ||
          [plan.id, plan.name, plan.operator].some((value) =>
            value.toLowerCase().includes(keyword),
          );

        const matchesType = auditType === "all" || plan.type === auditType;

        const matchesStatus = status === "All" || plan.status === status;

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        const diff =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

        return status === "Completed" ? -diff : diff;
      });
  }, [plans, search, auditType, status]);

  const visibleRows = useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, page, rowsPerPage],
  );

  const handleStatusChange = (next: AuditStatus | "All") => {
    setStatus(next);
    setPage(0);
    setSelected(null);
  };

  return (
    <Box
      sx={{
        mt: 2,
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            p: 2,
          }}
        >
          <Typography fontWeight={700}>Audit Tracker</Typography>

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
                setSearch(searchInput.trim().replace(/\s+/g, " "));
                setPage(0);
              }}
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", sm: 230 },
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
                inputProps={{ "aria-label": "search audits" }}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />

              {searchInput && (
                <IconButton
                  sx={{ p: "5px" }}
                  aria-label="clear search"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setPage(0);
                  }}
                >
                  <ClearIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}

              <IconButton type="submit" sx={{ p: "5px" }} aria-label="search">
                <SearchIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            <FormControl size="small" sx={{ minWidth: 155 }}>
              <Select
                value={auditType}
                onChange={(e) => {
                  setAuditType(e.target.value as AuditType | "all");
                  setPage(0);
                }}
                inputProps={{ "aria-label": "Audit type filter" }}
              >
                <MenuItem value="all">All audit types</MenuItem>
                <MenuItem value="cycle_count">Cycle Count</MenuItem>
                <MenuItem value="bom">BOM Completeness</MenuItem>
                <MenuItem value="location">Location Audit</MenuItem>
                <MenuItem value="free_stock">Free Stock / 4th Axis</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as AuditStatus | "All")
                }
                inputProps={{ "aria-label": "Audit status filter" }}
              >
                <MenuItem value="All">All statuses</MenuItem>
                <MenuItem value="Assigned">Assigned</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer sx={{ flex: 1 }}>
          <Table size="small">
            <TableHead
              sx={{
                bgcolor: theme.palette.primary.main,
              }}
            >
              <TableRow>
                <TableCell sx={headCellSx}>Audit ID</TableCell>
                <TableCell sx={headCellSx}>Audit Name</TableCell>
                <TableCell sx={headCellSx}>Type</TableCell>
                <TableCell sx={headCellSx}>Assigned To</TableCell>
                <TableCell sx={headCellSx}>Created On</TableCell>
                <TableCell sx={headCellSx}>Age</TableCell>
                <TableCell sx={headCellSx}>Source File</TableCell>
                <TableCell sx={headCellSx}>Status</TableCell>
                <TableCell align="center" sx={headCellSx}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No {status.toLowerCase()} audits.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((plan, index) => {
                  const ageDays = getAgeInDays(plan.createdAt);

                  const isStale =
                    plan.status === "Assigned" && ageDays >= STALE_AFTER_DAYS;

                  return (
                    <TableRow
                      key={plan.id}
                      sx={{
                        backgroundColor:
                          index % 2 === 1
                            ? alpha(theme.palette.primary.main, 0.2)
                            : "inherit",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.action.hover,
                            0.05,
                          ),
                        },
                      }}
                    >
                      <TableCell>{plan.id.slice(0, 8)}</TableCell>

                      <TableCell>{plan.name}</TableCell>

                      <TableCell>{AUDIT_LABELS[plan.type]}</TableCell>

                      <TableCell>{plan.operator}</TableCell>

                      <TableCell>
                        {new Date(plan.createdAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </TableCell>

                      <TableCell
                        sx={{
                          color: isStale ? "warning.main" : "text.secondary",
                          fontWeight: isStale ? 700 : 400,
                        }}
                      >
                        {plan.status === "Assigned" ? formatAge(ageDays) : "-"}
                      </TableCell>

                      <TableCell>{plan.fileName}</TableCell>

                      <TableCell>
                        <Chip
                          label={plan.status}
                          color={
                            plan.status === "Completed" ? "success" : "warning"
                          }
                          size="small"
                        />
                      </TableCell>

                      <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="View Audit">
                          <IconButton
                            size="small"
                            aria-label={`View ${plan.name}`}
                            onClick={() => setSelected(plan)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Audit">
                          <IconButton
                            size="small"
                            color="error"
                            aria-label={`Delete ${plan.name}`}
                            onClick={() => setDeleteTarget(plan)}
                          >
                            <DeleteIcon fontSize="small" />
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
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Audit</DialogTitle>

        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.name}</strong>?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>

          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (!deleteTarget) return;

              try {
                deletePlan(deleteTarget.id);

                if (selected?.id === deleteTarget.id) {
                  setSelected(null);
                }

                setPage(0);
                setDeleteTarget(null);
              } catch (error) {
                console.error("Unable to delete mock audit", error);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
