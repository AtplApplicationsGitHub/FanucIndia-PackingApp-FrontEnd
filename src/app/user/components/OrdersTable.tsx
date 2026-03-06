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
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import Badge from "@mui/material/Badge";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface Props {
  orders: SalesOrder[];
  loading: boolean;
  onDetailedView: (order: SalesOrder) => void;
  onOpenChat: (soNumber: string, orderId: number) => void;
}

const AssignedOrdersTable: React.FC<Props> = ({ orders, loading, onDetailedView, onOpenChat }) => {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

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
        elevation={0}
        sx={{
          borderRadius: 0,
          width: "100%",
          overflowX: "auto"
        }}
      >
        <Table 
          sx={{
            minWidth: 650,
            width: "100%",
            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
              backgroundColor: lightYellow,
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
              bgcolor: theme.palette.mode === "dark" ? "#000000" : "#ffffff",
            }}
          >
            <TableRow sx={{ height: 60 }}>
              <TableCell 
                sx={{ 
                  color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
                  fontWeight: 700, 
                  whiteSpace: "nowrap" 
                }}
              >
                ACTIONS
              </TableCell>
              {[
                "PRODUCT",
                "SALE ORDER NUMBER",
                "OUT BOUND DELIVERY",
                "TRANSFER ORDER",
                "PACKING CONFIGURATION",
                "SPECIAL REMARKS",
                "STATUS"
              ].map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                   <Typography variant="body2" color="text.secondary">
                     No assigned orders found.
                   </Typography>
                 </TableCell>
               </TableRow>
            ) : (
              visibleRows.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.action.hover, 0.05),
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={() => handleViewDetails(row)}
                          size="small"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton 
                        onClick={() => row.saleOrderNumber && onOpenChat(row.saleOrderNumber, row.id)}
                        size="small"
                      >
                        <Badge badgeContent={row.notificationCount || 0} color="error">
                          <ChatBubbleOutlineIcon fontSize="small" />
                        </Badge>
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>{row.product?.name || "-"}</TableCell>
                  <TableCell>{row.saleOrderNumber || "-"}</TableCell>
                  <TableCell>{row.outboundDelivery || "-"}</TableCell>
                  <TableCell>{row.transferOrder || "-"}</TableCell>
                  <TableCell>{row.packConfig?.configName || "-"}</TableCell>
                  <TableCell>{row.specialRemarks || "-"}</TableCell>
                  <TableCell>
                    {(() => {
                      if (!row.status) return <Box>-</Box>;
                      let colorMain = theme.palette.grey[500];
                      let label = row.status;
                      if (row.status === "R105") { colorMain = "#3b82f6"; label = "R105"; }
                      else if (row.status === "W105") { colorMain = "#eab308"; label = "W105"; }
                      else if (row.status === "F105") { colorMain = "#8b5cf6"; label = "F105"; }
                      else if (row.status === "Dispatched") { colorMain = "#10b981"; label = "Dispatched"; }
                      
                      return (
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "3px 10px",
                            borderRadius: "16px",
                            border: "1px solid",
                            borderColor: alpha(colorMain, 0.5),
                            backgroundColor: alpha(colorMain, 0.1),
                            color: colorMain === "#eab308" ? "#b45309" : colorMain,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            minWidth: "50px",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {label}
                        </Box>
                      );
                    })()}
                  </TableCell>
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
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      />
    </Box>
  );
};

export default AssignedOrdersTable;