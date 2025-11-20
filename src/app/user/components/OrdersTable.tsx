"use client";

import * as React from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  useTheme,
  alpha,
  Typography,
  CircularProgress
} from "@mui/material";
import { Eye } from "lucide-react";
import { SalesOrder } from "@/app/admin/components/types/admin";

interface Props {
  orders: SalesOrder[];
  loading: boolean;
  onDetailedView: (order: SalesOrder) => void;
}

const AssignedOrdersTable: React.FC<Props> = ({ orders, loading, onDetailedView }) => {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.1);

  // --- Pagination State ---
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate visible rows
  const visibleRows = React.useMemo(
    () => orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [orders, page, rowsPerPage]
  );

  const handleViewDetails = (order: SalesOrder) => {
    onDetailedView(order);
  };

  if (loading && orders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 0,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              {/* Plain Header (No background color) */}
              <TableCell align="center" sx={{ fontWeight: "bold" }}>Action</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Product</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Sale Order Number</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Outbound Delivery</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Transfer Order</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Packing Configuration</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Special Remarks</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                   <Typography variant="body2" color="text.secondary">
                     No assigned orders found.
                   </Typography>
                 </TableCell>
               </TableRow>
            ) : (
              visibleRows.map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{
                    // Alternating row colors: Light Yellow for every second row
                    backgroundColor: index % 2 === 0 ? "inherit" : lightYellow,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.action.hover, 0.05),
                    },
                  }}
                >
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        onClick={() => handleViewDetails(row)}
                        size="small"
                      >
                        <Eye size={18} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{row.product?.name || "-"}</TableCell>
                  <TableCell>{row.saleOrderNumber}</TableCell>
                  <TableCell>{row.outboundDelivery}</TableCell>
                  <TableCell>{row.transferOrder}</TableCell>
                  <TableCell>{row.packConfig?.configName || "-"}</TableCell>
                  <TableCell>{row.specialRemarks || "-"}</TableCell>
                  <TableCell>{row.status || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default AssignedOrdersTable;