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
import { useTheme, alpha } from "@mui/material/styles";
import { Tooltip } from "@mui/material";
import { Download } from "lucide-react";
import { exportToExcel } from "@/app/admin/components/utils/exportExcel";
import { useRouter } from "next/navigation";

interface FgLocationOrder {
  saleOrderNumber: string;
  outboundDelivery: string | null;
  location: unknown;
}

interface FgLocationOrdersDialogProps {
  open: boolean;
  onClose: () => void;
  orders: FgLocationOrder[];
}

const formatLocation = (location: unknown): string => {
  if (location === null || location === undefined) return "-";
  if (typeof location === "string") return location;
  try {
    return JSON.stringify(location);
  } catch {
    return "-";
  }
};

const FgLocationOrdersDialog = ({
  open,
  onClose,
  orders,
}: FgLocationOrdersDialogProps) => {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginatedRows = orders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );
  const router = useRouter();

  const handleViewOrder = (so: string, obd: string | null) => {
    onClose();
    router.push(
      `/so-search/${encodeURIComponent(so)}/${encodeURIComponent(obd ?? "")}`,
    );
  };

  const handleExport = async () => {
    const formatted = orders.map((order) => ({
      "SO Number": order.saleOrderNumber,
      "Outbound Delivery": order.outboundDelivery ?? "-",
      Location: formatLocation(order.location),
    }));
    const now = new Date();
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const dt = ist.toISOString().replace(/[-:T]/g, "_").slice(0, 19);
    await exportToExcel(formatted, `FG_LOCATION_${dt}`);
  };

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
          color: "secondary.main",
          p: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          FG LOCATION ORDERS
          <Tooltip title="Export to Excel">
            <IconButton
              onClick={handleExport}
              size="small"
              sx={{ color: "#10B981" }}
            >
              <Download size={18} />
            </IconButton>
          </Tooltip>
        </Box>
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
                {["SO Number", "Outbound Delivery", "Location"].map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      fontWeight: "bold",
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography color="text.secondary" p={3}>
                      No FG location orders found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((order, idx) => (
                  <TableRow
                    key={`${order.saleOrderNumber}-${order.outboundDelivery ?? idx}`}
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
                        {order.saleOrderNumber || "-"}
                      </Box>
                    </TableCell>
                    <TableCell>{order.outboundDelivery || "-"}</TableCell>
                    <TableCell sx={{ wordBreak: "break-all" }}>
                      {formatLocation(order.location)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={orders.length}
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
};

export default FgLocationOrdersDialog;
