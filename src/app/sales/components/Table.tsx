"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Link as MuiLink,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Link from "next/link";
import { SalesOrder, LookupData } from "@/app/sales/components/types/sales";
import { findName, formatDate } from "@/app/sales/components/utils/sales";
import { GridPaginationModel } from "@mui/x-data-grid";

type Props = {
  orders: SalesOrder[];
  lookup: LookupData;
  totalOrders: number;
  onEdit: (order: SalesOrder) => void;
  onDelete: (id: number) => void;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
};

export default function SalesOrdersTable({
  orders,
  lookup,
  totalOrders,
  onEdit,
  onDelete,
  paginationModel,
  onPaginationModelChange,
}: Props) {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.08);
  const hoverYellow = alpha(theme.palette.primary.main, 0.15);

  // --- MENU STATE ---
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = React.useState<number | null>(null);

  const menuRow = React.useMemo(
    () => orders.find((o) => o.id === menuRowId),
    [orders, menuRowId]
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, rowId: number) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuRowId(rowId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuRowId(null);
  };

  const handleEdit = () => {
    if (menuRow) onEdit(menuRow);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (menuRowId) onDelete(menuRowId);
    handleMenuClose();
  };

  // --- PAGINATION HANDLERS ---
  const handleChangePage = (event: unknown, newPage: number) => {
    onPaginationModelChange({ ...paginationModel, page: newPage });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPaginationModelChange({
      ...paginationModel,
      pageSize: parseInt(event.target.value, 10),
      page: 0, // Reset to first page on page size change
    });
  };

  // Logic to check if actions are disabled (from original ActionsCell)
  const isAssigned = !!menuRow?.assignedUserId;

  return (
    <Box
      sx={{
        width: "100%",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
        <Table
          sx={{
            minWidth: 650,
            // Zebra striping & No borders logic
            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
              backgroundColor: lightYellow,
            },
            "& .MuiTableBody-root .MuiTableRow-root:hover": {
              backgroundColor: hoverYellow,
            },
            "& .MuiTableCell-root": {
              borderBottom: "none",
              py: 1,
              px: 2,
              fontSize: "0.875rem",
            },
          }}
        >
          <TableHead 
            sx={{ 
              // White background for light mode, Black for dark mode
              bgcolor: (theme) => theme.palette.mode === "dark" ? "#000000" : "#ffffff",
            }}
          >
            <TableRow sx={{ height: 60 }}>
              {[
                "Actions",
                "Product",
                "Sale Order Number",
                "OutBound Delivery",
                "Transfer Order",
                "Required Date",
                "Transporter",
                "Plant Code",
                "Payment",
                "Sales Zone",
                "Packing Config",
                "Customer",
                "Special Remarks",
                "Status",
              ].map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    color: (theme) => theme.palette.mode === "dark" ? "#ffffff" : "#000000",
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
                <TableCell colSpan={14} align="center" sx={{ py: 4 }}>
                  No orders found. Create your first order!
                </TableCell>
              </TableRow>
            ) : (
              orders.map((row) => (
                <TableRow key={row.id}>
                  {/* ACTIONS */}
                  <TableCell>
                    <IconButton onClick={(e) => handleMenuOpen(e, row.id)} size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>

                  {/* PRODUCT */}
                  <TableCell>
                    {findName(lookup.products, row.productId)}
                  </TableCell>

                  {/* SALE ORDER NUMBER (LINK) */}
                  <TableCell>
                    <MuiLink
                      component={Link}
                      href={`/so-search/${row.saleOrderNumber}`}
                      underline="hover"
                      sx={{ fontWeight: 500 }}
                    >
                      {row.saleOrderNumber}
                    </MuiLink>
                  </TableCell>

                  {/* OUTBOUND DELIVERY */}
                  <TableCell>{row.outboundDelivery}</TableCell>

                  {/* TRANSFER ORDER */}
                  <TableCell>{row.transferOrder}</TableCell>

                  {/* DELIVERY DATE */}
                  <TableCell>
                    {row.deliveryDate ? formatDate(row.deliveryDate) : "-"}
                  </TableCell>

                  {/* TRANSPORTER */}
                  <TableCell>
                    {findName(lookup.transporters, row.transporterId)}
                  </TableCell>

                  {/* PLANT CODE */}
                  <TableCell>
                    {findName(lookup.plantCodes, row.plantCodeId, "code")}
                  </TableCell>

                  {/* PAYMENT */}
                  <TableCell>
                    {row.paymentClearance ? "Yes" : "No"}
                  </TableCell>

                  {/* SALES ZONE */}
                  <TableCell>
                    {findName(lookup.salesZones, row.salesZoneId)}
                  </TableCell>

                  {/* PACK CONFIG */}
                  <TableCell>
                    {findName(lookup.packConfigs, row.packConfigId, "configName")}
                  </TableCell>

                  {/* CUSTOMER */}
                  <TableCell>
                    {findName(lookup.customers, row.customerId, "name")}
                  </TableCell>

                  {/* SPECIAL REMARKS */}
                  <TableCell>{row.specialRemarks || "-"}</TableCell>

                  {/* STATUS */}
                  <TableCell>{row.status || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <TablePagination
        component="div"
        count={totalOrders}
        page={paginationModel.page} // 0-based index
        onPageChange={handleChangePage}
        rowsPerPage={paginationModel.pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      />

      {/* ACTIONS MENU */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Tooltip title={isAssigned ? "This order is assigned and cannot be edited." : ""}>
          <Box>
            <MenuItem onClick={handleEdit} disabled={isAssigned}>
              Edit
            </MenuItem>
          </Box>
        </Tooltip>

        <Tooltip title={isAssigned ? "This order is assigned and cannot be deleted." : ""}>
          <Box>
            <MenuItem
              onClick={handleDelete}
              sx={{ color: "error.main" }}
              disabled={isAssigned}
            >
              Delete
            </MenuItem>
          </Box>
        </Tooltip>
      </Menu>
    </Box>
  );
}