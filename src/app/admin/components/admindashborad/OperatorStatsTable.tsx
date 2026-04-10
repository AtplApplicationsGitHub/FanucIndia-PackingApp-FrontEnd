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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import dayjs from "dayjs";
import { useOperatorStats, OrderDetail } from "../hooks/useOperatorStats";

export default function OperatorStatsTable({
  selectedDate,
}: {
  selectedDate: string;
}) {
  const { data: stats = [], loading } = useOperatorStats(selectedDate);

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogData, setDialogData] = useState<OrderDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
          }}
        >
          <h2 className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
            Operator Productivity ({dayjs(selectedDate).format("D MMM YYYY")})
          </h2>
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
                    Issue Stage
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
                    Packing Stage
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
                {stats
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
                              `${row.operatorName} - ISSUED ASSIGNED`,
                              row.issueAssigned || [],
                            )
                          }
                          sx={{
                            minWidth: 0,
                            p: 0.5,
                            fontWeight: "bold",
                            color: "#D97706",
                          }}
                          disabled={
                            !row.issueAssigned || row.issueAssigned.length === 0
                          }
                        >
                          {row.issueAssignedCount}
                        </Button>
                      </TableCell>

                      <TableCell align="center" sx={{ borderColor: "divider" }}>
                        <Button
                          onClick={() =>
                            handleOpenDialog(
                              `${row.operatorName} -  Issue Completed`,
                              row.issueCompleted || [],
                            )
                          }
                          sx={{
                            minWidth: 0,
                            p: 0.5,
                            fontWeight: "bold",
                            color: "success.main",
                          }}
                          disabled={
                            !row.issueCompleted ||
                            row.issueCompleted.length === 0
                          }
                        >
                          {row.issueCompletedCount}
                        </Button>
                      </TableCell>

                      <TableCell align="center" sx={{ borderColor: "divider" }}>
                        <Button
                          onClick={() =>
                            handleOpenDialog(
                              `${row.operatorName} - PACKING ASSIGNED`,
                              row.packingAssigned || [],
                            )
                          }
                          sx={{
                            minWidth: 0,
                            p: 0.5,
                            fontWeight: "bold",
                            color: "#D97706",
                          }}
                          disabled={
                            !row.packingAssigned ||
                            row.packingAssigned.length === 0
                          }
                        >
                          {row.packingAssignedCount}
                        </Button>
                      </TableCell>

                      <TableCell align="center" sx={{ borderColor: "divider" }}>
                        <Button
                          onClick={() =>
                            handleOpenDialog(
                              `${row.operatorName} - Packing Completed`,
                              row.packingCompleted || [],
                            )
                          }
                          sx={{
                            minWidth: 0,
                            p: 0.5,
                            fontWeight: "bold",
                            color: "success.main",
                          }}
                          disabled={
                            !row.packingCompleted ||
                            row.packingCompleted.length === 0
                          }
                        >
                          {row.packingCompletedCount}
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
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            component="div"
            fontWeight="bold"
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark" ? "#FF6B6B" : "#D00000",
            }}
          >
            {dialogTitle}
          </Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small">
            <CloseIcon />
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
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", bgcolor: "background.default" }}
                  >
                    S.No
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", bgcolor: "background.default" }}
                  >
                    SO Number
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", bgcolor: "background.default" }}
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
                      <TableCell>{order.saleOrderNumber}</TableCell>
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
