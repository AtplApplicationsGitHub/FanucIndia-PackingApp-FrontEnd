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
  CircularProgress,
  Theme
} from "@mui/material";
import { SalesOrder } from "@/app/admin/components/types/admin";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import Badge from "@mui/material/Badge";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface StatusConfig {
  colorMain: string;
  label: string;
}

function getStatusConfig(status: string, theme: Theme): StatusConfig {
  switch (status) {
    case "R105": return { colorMain: "#3b82f6", label: "R105" };
    case "W105": return { colorMain: "#eab308", label: "W105" };
    case "F105": return { colorMain: "#8b5cf6", label: "F105" };
    case "Dispatched": return { colorMain: "#10b981", label: "Dispatched" };
    default: return { colorMain: theme.palette.grey[500], label: status };
  }
}

interface StatusChipProps {
  status: string | null | undefined;
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const theme = useTheme();

  if (!status) return <Box>-</Box>;

  const { colorMain, label } = getStatusConfig(status, theme);

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
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  );
};

const COLUMN_HEADERS = [
  "PRODUCT",
  "SALE ORDER NUMBER",
  "OUT BOUND DELIVERY",
  "TRANSFER ORDER",
  "PACKING CONFIGURATION",
  "SPECIAL REMARKS",
  "STATUS",
] as const;

// Total columns = 1 
const TOTAL_COLUMNS = COLUMN_HEADERS.length + 1;

interface Props {
  orders: SalesOrder[];
  loading: boolean;
  onDetailedView: (order: SalesOrder) => void;
  onOpenChat: (soNumber: string, orderId: number) => void;
}

const AssignedOrdersTable: React.FC<Props> = ({ orders, loading, onDetailedView, onOpenChat }) => {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  // Pagination State 
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
              {COLUMN_HEADERS.map((head) => (
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
                <TableCell colSpan={TOTAL_COLUMNS} align="center" sx={{ py: 4 }}>
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
                          onClick={() => onDetailedView(row)}
                          size="small"
                          aria-label="View order details"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open Chat">
                        <IconButton
                          onClick={() =>
                            row.saleOrderNumber &&
                            onOpenChat(row.saleOrderNumber, row.id)
                          }
                          size="small"
                          aria-label="Open chat for this order"
                        >
                          <Badge
                            badgeContent={row.notificationCount || 0}
                            color="error"
                          >
                            <ChatBubbleOutlineIcon fontSize="small" />
                          </Badge>
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>{row.product?.name || "-"}</TableCell>
                  <TableCell>{row.saleOrderNumber || "-"}</TableCell>
                  <TableCell>{row.outboundDelivery || "-"}</TableCell>
                  <TableCell>{row.transferOrder || "-"}</TableCell>
                  <TableCell>{row.packConfig?.configName || "-"}</TableCell>
                  <TableCell>{row.specialRemarks || "-"}</TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
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