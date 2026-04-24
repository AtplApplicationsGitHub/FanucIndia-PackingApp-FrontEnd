"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Button,
  TablePagination,
  Avatar,
  useTheme,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";
import { useOperatorStats, OrderDetail } from "../hooks/useOperatorStats";
import Link from "next/link";

export default function OperatorStatsTable({
  selectedDate,
}: {
  selectedDate: string;
}) {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  const { data: stats = [], loading } = useOperatorStats(selectedDate);

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogData, setDialogData] = useState<OrderDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<"issue" | "packing">(
    "issue",
  );

  // Reset to first page when date/data changes
  useEffect(() => {
    setPage(0);
  }, [selectedDate]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (title: string, data: OrderDetail[]) => {
    setDialogTitle(title);
    setDialogData(data);
    setSearchQuery("");
    setDialogOpen(true);
  };

  const filteredDialogData = dialogData.filter(
    (d) =>
      d.saleOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.outboundDelivery.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedStats = [...stats].sort((a, b) => {
    const aTotal =
      selectedStage === "issue"
        ? a.issueAssignedCount + a.issueCompletedCount
        : a.packingAssignedCount + a.packingCompletedCount;
    const bTotal =
      selectedStage === "issue"
        ? b.issueAssignedCount + b.issueCompletedCount
        : b.packingAssignedCount + b.packingCompletedCount;

    if (bTotal !== aTotal) return bTotal - aTotal;

    // Tie-breaker: keep ordering stable and readable
    return a.operatorName.localeCompare(b.operatorName);
  });

  return (
    <Card sx={{ height: "100%", borderRadius: 2, boxShadow: 2 }}>
      <CardContent sx={{ height: "100%", p: 0 }}>
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <h2 className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
            Operator Productivity ({dayjs(selectedDate).format("D MMM YYYY")})
          </h2>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "action.hover",
              borderRadius: 2,
              p: 0.5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Button
              disableRipple
              size="small"
              onClick={() => setSelectedStage("issue")}
              sx={{
                px: 1.6,
                py: 0.65,
                fontSize: "0.875rem",
                fontWeight: 500,
                borderRadius: 1.5,
                textTransform: "none",
                minWidth: "unset",
                bgcolor:
                  selectedStage === "issue"
                    ? "background.paper"
                    : "transparent",
                color: selectedStage === "issue" ? "#D00000" : "text.secondary",
                boxShadow: selectedStage === "issue" ? 1 : "none",
                "&:hover": {
                  bgcolor:
                    selectedStage === "issue"
                      ? "background.paper"
                      : "transparent",
                  color: selectedStage === "issue" ? "#D00000" : "text.primary",
                },
              }}
            >
              Issue
            </Button>
            <Button
              disableRipple
              size="small"
              onClick={() => setSelectedStage("packing")}
              sx={{
                px: 1.6,
                py: 0.65,
                fontSize: "0.875rem",
                fontWeight: 500,
                borderRadius: 1.5,
                textTransform: "none",
                minWidth: "unset",
                bgcolor:
                  selectedStage === "packing"
                    ? "background.paper"
                    : "transparent",
                color:
                  selectedStage === "packing" ? "#D00000" : "text.secondary",
                boxShadow: selectedStage === "packing" ? 1 : "none",
                "&:hover": {
                  bgcolor:
                    selectedStage === "packing"
                      ? "background.paper"
                      : "transparent",
                  color:
                    selectedStage === "packing" ? "#D00000" : "text.primary",
                },
              }}
            >
              Packing
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 250,
            }}
          >
            <CircularProgress size={30} />
          </Box>
        ) : stats.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 250,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No operator data available.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "background.paper" }}>
                  <TableCell
                    sx={{
                      fontWeight: 800,
                      textTransform: "uppercase",
                      fontSize: "0.85rem",
                      letterSpacing: 0.5,
                      color: (theme) =>
                        theme.palette.mode === "dark" ? "#BAE6FD" : "#0C4A6E",
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    Operators
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      textTransform: "uppercase",
                      fontSize: "0.85rem",
                      letterSpacing: 0.5,
                      borderBottom: 1,
                      borderColor: "divider",
                      color: (theme) =>
                        theme.palette.mode === "dark" ? "#BAE6FD" : "#0C4A6E",
                    }}
                    colSpan={2}
                  >
                    {selectedStage === "issue"
                      ? "Issue Stage"
                      : "Packing Stage"}
                  </TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: "background.paper" }}>
                  <TableCell sx={{ borderBottom: 1, borderColor: "divider" }} />
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: "#D97706",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    Assigned
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: "success.main",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    Completed
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedStats
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.operatorEmail} hover>
                      <TableCell
                        sx={{ fontWeight: 500, borderColor: "divider" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: "0.85rem",
                              fontWeight: "bold",
                              bgcolor: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "#0EA5E9"
                                  : "#BAE6FD",
                              color: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "#FFFFFF"
                                  : "#0369A1",
                            }}
                          >
                            {row.operatorName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {row.operatorName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {row.operatorEmail}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell align="center" sx={{ borderColor: "divider" }}>
                        <Button
                          onClick={() =>
                            handleOpenDialog(
                              `${row.operatorEmail} - ${
                                selectedStage === "issue"
                                  ? "ISSUE ASSIGNED"
                                  : "PACKING ASSIGNED"
                              }`,
                              selectedStage === "issue"
                                ? row.issueAssigned || []
                                : row.packingAssigned || [],
                            )
                          }
                          sx={{
                            minWidth: 0,
                            p: 0.5,
                            fontWeight: "bold",
                            color: "#D97706",
                          }}
                          disabled={
                            selectedStage === "issue"
                              ? !row.issueAssigned ||
                                row.issueAssigned.length === 0
                              : !row.packingAssigned ||
                                row.packingAssigned.length === 0
                          }
                        >
                          {selectedStage === "issue"
                            ? row.issueAssignedCount
                            : row.packingAssignedCount}
                        </Button>
                      </TableCell>

                      <TableCell align="center" sx={{ borderColor: "divider" }}>
                        <Button
                          onClick={() =>
                            handleOpenDialog(
                              `${row.operatorEmail} - ${
                                selectedStage === "issue"
                                  ? "ISSUE COMPLETED"
                                  : "PACKING COMPLETED"
                              }`,
                              selectedStage === "issue"
                                ? row.issueCompleted || []
                                : row.packingCompleted || [],
                            )
                          }
                          sx={{
                            minWidth: 0,
                            p: 0.5,
                            fontWeight: "bold",
                            color: "success.main",
                          }}
                          disabled={
                            selectedStage === "issue"
                              ? !row.issueCompleted ||
                                row.issueCompleted.length === 0
                              : !row.packingCompleted ||
                                row.packingCompleted.length === 0
                          }
                        >
                          {selectedStage === "issue"
                            ? row.issueCompletedCount
                            : row.packingCompletedCount}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Box>
        )}
        {!loading && stats.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={stats.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: 1,
              borderColor: "divider",
            }}
          />
        )}
      </CardContent>

      {/* Orders List Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            fontSize: "20px",
            letterSpacing: 0.5,
            color: "error.main",
            pb: 1,
            position: "relative",
          }}
        >
          {dialogTitle}
          <IconButton
            onClick={() => setDialogOpen(false)}
            size="small"
            sx={{ position: "absolute", right: 12 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by SO Number or OBD..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    sx={{ color: "text.secondary", mr: 1, fontSize: 20 }}
                  />
                ),
              }}
            />
          </Box>
          <Box
            sx={{
              maxHeight: 400,
              overflowY: "auto",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Table
              size="small"
              stickyHeader
              sx={{
                "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
                  backgroundColor: lightYellow,
                },
                "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root":
                  {
                    borderBottom: 0,
                  },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                    }}
                  >
                    S.No
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                    }}
                  >
                    SO Number
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                    }}
                  >
                    OBD
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDialogData.length > 0 ? (
                  filteredDialogData.map((order, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Link
                          href={`/so-search/${encodeURIComponent(
                            order.saleOrderNumber,
                          )}/${encodeURIComponent(order.outboundDelivery)}`}
                          style={{
                            color: "#1976d2",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          {order.saleOrderNumber}
                        </Link>
                      </TableCell>

                      <TableCell>{order.outboundDelivery}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{ py: 3, color: "text.secondary" }}
                    >
                      No orders found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
