"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useTheme, alpha } from "@mui/material/styles";

interface BacklogOrder {
  saleOrderNumber: string;
  outboundDelivery: string;
  customerName: string | null;
  paymentClearance: boolean;
}

interface BacklogItem {
  date: string;
  dayLabel: string;
  count: number;
  orders: BacklogOrder[];
}

interface BacklogOrdersDialogProps {
  open: boolean;
  onClose: () => void;
  breakdown: BacklogItem[];
}

export default function BacklogOrdersDialog({
  open,
  onClose,
  breakdown,
}: BacklogOrdersDialogProps) {
  const router = useRouter();
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleViewOrder = (so: string, obd: string) => {
    onClose();
    router.push(
      `/so-search/${encodeURIComponent(so)}/${encodeURIComponent(obd)}`,
    );
  };

  const rows = (breakdown || []).flatMap((day) =>
    day.orders.map((order) => ({ ...order, dayLabel: day.dayLabel })),
  );

  const paginatedRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { maxHeight: 560 } }}
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
        BACKLOG
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 380,
            overflowY: "scroll",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Table
            stickyHeader
            size="small"
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
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: "bold",
                  }}
                >
                  SO Number
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: "bold",
                  }}
                >
                  Outbound Delivery
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: "bold",
                  }}
                >
                  Customer Name
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: "bold",
                  }}
                >
                  Payment
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: "bold",
                  }}
                >
                  Required Date
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" p={3}>
                      No backlog orders.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((order, idx) => (
                  <TableRow
                    key={`${order.saleOrderNumber}-${order.outboundDelivery}-${idx}`}
                  >
                    <TableCell>
                      <Box
                        component="span"
                        onClick={() =>
                          handleViewOrder(
                            order.saleOrderNumber,
                            order.outboundDelivery,
                          )
                        }
                        sx={{
                          color: "#1565C0",
                          fontWeight: 600,
                          cursor: "pointer",
                          textDecoration: "none",
                          "&:hover": { color: "#0D47A1" },
                        }}
                      >
                        {order.saleOrderNumber}
                      </Box>
                    </TableCell>
                    <TableCell>{order.outboundDelivery}</TableCell>
                    <TableCell>{order.customerName ?? "—"}</TableCell>
                    <TableCell>
                      {order.paymentClearance === true ? "Yes" : "No"}
                    </TableCell>
                    <TableCell>{order.dayLabel}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
          sx={{ color: "text.primary" }}
        />
      </DialogContent>
    </Dialog>
  );
}
