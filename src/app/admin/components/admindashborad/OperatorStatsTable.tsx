"use client";

import React, { useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useOperatorStats, OrderDetail } from "../hooks/useOperatorStats";

export default function OperatorStatsTable({
  selectedDate,
}: {
  selectedDate: string;
}) {
  const { data: stats = [], loading } = useOperatorStats(selectedDate);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogData, setDialogData] = useState<OrderDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography
            variant="h6"
            fontWeight="600"
            color="#D00000"
            textTransform="uppercase"
          >
            Operator Productivity
          </Typography>
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
                    rowSpan={2}
                    sx={{
                      fontWeight: 800,
                      textTransform: "uppercase",
                      fontSize: "0.85rem",
                      letterSpacing: 0.5,
                    }}
                    className="text-[#D00000] dark:text-[#FF6B6B]"
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
                    }}
                    colSpan={2}
                  >
                    Packing Stage
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Assigned
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Completed
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Assigned
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Completed
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.map((row) => (
                  <TableRow key={row.operatorName} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {row.operatorName}
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        onClick={() =>
                          handleOpenDialog(
                            `${row.operatorName} - Issue Assigned`,
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
                        {row.issueAssigned?.length || 0}
                      </Button>
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        onClick={() =>
                          handleOpenDialog(
                            `${row.operatorName} - Issue Completed`,
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
                          !row.issueCompleted || row.issueCompleted.length === 0
                        }
                      >
                        {row.issueCompleted?.length || 0}
                      </Button>
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        onClick={() =>
                          handleOpenDialog(
                            `${row.operatorName} - Packing Assigned`,
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
                        {row.packingAssigned?.length || 0}
                      </Button>
                    </TableCell>

                    <TableCell align="center">
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
                        {row.packingCompleted?.length || 0}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
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
          <Typography variant="h6" component="div" fontWeight="bold">
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
