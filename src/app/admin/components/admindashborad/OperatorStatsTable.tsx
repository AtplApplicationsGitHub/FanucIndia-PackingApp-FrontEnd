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
      d.outboundDelivery.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card sx={{ height: "100%", borderRadius: 2, boxShadow: 2 }}>
      <CardContent sx={{ height: "100%", p: 0 }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
          <Typography variant="h6" fontWeight="600" color="primary.main">
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
              <TableHead sx={{ bgcolor: "grey.100" }}>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", borderRight: "1px solid #ddd" }}
                  >
                    Operator
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }} colSpan={2}>
                    Issue Stage
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", borderLeft: "1px solid #ddd" }}
                    colSpan={2}
                  >
                    Packing Stage
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ borderRight: "1px solid #ddd" }}></TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Assigned</TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Completed</TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.75rem", color: "text.secondary", borderLeft: "1px solid #ddd" }}>Assigned</TableCell>
                  <TableCell align="center" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.map((row) => (
                  <TableRow key={row.operatorName} hover>
                    <TableCell sx={{ fontWeight: 500, borderRight: "1px solid #eee" }}>
                      {row.operatorName}
                    </TableCell>
                    
                    <TableCell align="center">
                      <Button
                        onClick={() => handleOpenDialog(`${row.operatorName} - Issue Assigned`, row.issueAssigned)}
                        sx={{ minWidth: 0, p: 0.5, fontWeight: "bold", color: "#D97706" }} 
                        disabled={row.issueAssigned.length === 0}
                      >
                        {row.issueAssigned.length}
                      </Button>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Button
                        onClick={() => handleOpenDialog(`${row.operatorName} - Issue Completed`, row.issueCompleted)}
                        sx={{ minWidth: 0, p: 0.5, fontWeight: "bold", color: "success.main" }}
                        disabled={row.issueCompleted.length === 0}
                      >
                        {row.issueCompleted.length}
                      </Button>
                    </TableCell>
                    
                    <TableCell align="center" sx={{ borderLeft: "1px solid #eee" }}>
                      <Button
                        onClick={() => handleOpenDialog(`${row.operatorName} - Packing Assigned`, row.packingAssigned)}
                        sx={{ minWidth: 0, p: 0.5, fontWeight: "bold", color: "#D97706" }} 
                        disabled={row.packingAssigned.length === 0}
                      >
                        {row.packingAssigned.length}
                      </Button>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Button
                        onClick={() => handleOpenDialog(`${row.operatorName} - Packing Completed`, row.packingCompleted)}
                        sx={{ minWidth: 0, p: 0.5, fontWeight: "bold", color: "success.main" }}
                        disabled={row.packingCompleted.length === 0}
                      >
                        {row.packingCompleted.length}
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
        <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />,
              }}
            />
          </Box>
          <Box sx={{ maxHeight: 400, overflowY: "auto", border: "1px solid #e0e0e0", borderRadius: 1 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>S.No</TableCell>
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>SO Number</TableCell>
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>OBD</TableCell>
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
                    <TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.secondary" }}>
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