"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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

  const sortedStats = [...stats]
    .filter((row) => {
      const total =
        selectedStage === "issue"
          ? row.issueAssignedCount + row.issueCompletedCount
          : row.packingAssignedCount + row.packingCompletedCount;
      return total > 0;
    })
    .sort((a, b) => {
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
    <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] h-full chart-no-focus">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex items-center gap-2 p-3">
          <h2 className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
            Operator Productivity ({dayjs(selectedDate).format("D MMM YYYY")})
          </h2>
        </div>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "action.hover",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            mt: 1,
            mr: 1,
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
                selectedStage === "issue" ? "background.paper" : "transparent",
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
              color: selectedStage === "packing" ? "#D00000" : "text.secondary",
              boxShadow: selectedStage === "packing" ? 1 : "none",
              "&:hover": {
                bgcolor:
                  selectedStage === "packing"
                    ? "background.paper"
                    : "transparent",
                color: selectedStage === "packing" ? "#D00000" : "text.primary",
              },
            }}
          >
            Packing
          </Button>
        </Box>
      </div>

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
      ) : (
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm border-t border-[#E5E7EB] dark:border-[#4B5563]">
            <thead className="bg-[#F7F7F7] dark:bg-[#2C3540]">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-[#1F2933] dark:text-[#E5E7EB] uppercase tracking-wider">
                  Operators
                </th>
                <th className="px-3 py-2 text-center font-semibold uppercase tracking-wider text-[#D97706]">
                  Assigned
                </th>
                <th className="px-3 py-2 text-center font-semibold uppercase tracking-wider text-[#16a34a]">
                  Completed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#4B5563]">
              {sortedStats.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    No operator data available for {selectedStage} stage.
                  </td>
                </tr>
              ) : (
                sortedStats
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <tr
                      key={row.operatorEmail}
                      className="hover:bg-[#F7F7F7] dark:hover:bg-[#2C3540] transition bg-white dark:bg-[#1F2933]"
                    >
                      <td className="px-3 py-2">
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
                          <Typography variant="body2" fontWeight="bold">
                            {row.operatorName}{" "}
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              ({row.operatorEmail})
                            </Typography>
                          </Typography>
                        </Box>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          onClick={() =>
                            handleOpenDialog(
                              `${row.operatorEmail} - ${selectedStage === "issue" ? "ISSUE ASSIGNED" : "PACKING ASSIGNED"}`,
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
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          onClick={() =>
                            handleOpenDialog(
                              `${row.operatorEmail} - ${selectedStage === "issue" ? "ISSUE COMPLETED" : "PACKING COMPLETED"}`,
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
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {!loading && sortedStats.length > 0 && (
        <div className="flex justify-end border-t border-[#E5E7EB] dark:border-[#4B5563]">
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={sortedStats.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ color: "text.primary" }}
          />
        </div>
      )}

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
    </div>
  );
}
