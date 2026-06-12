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
  Link as MuiLink,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import Link from "next/link";
import { SalesOrder, LookupData } from "@/app/sales/components/types/sales";
import { findName, formatDate } from "@/app/sales/components/utils/sales";
import { GridPaginationModel } from "@mui/x-data-grid";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import Badge from "@mui/material/Badge";
import Checkbox from "@mui/material/Checkbox";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type Props = {
  view?: "home" | "orders" | "dispatched";
  orders: SalesOrder[];
  lookup: LookupData;
  totalOrders: number;
  onEdit: (order: SalesOrder) => void;
  onDelete: (id: number) => void;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onOpenChat: (soNumber: string, orderId: number) => void;
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
};

export default function SalesOrdersTable({
  view,
  orders,
  lookup,
  totalOrders,
  onEdit,
  onDelete,
  paginationModel,
  onPaginationModelChange,
  onOpenChat,
  selectedIds,
  onSelectedIdsChange,
}: Props) {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);
  const hoverYellow = alpha(theme.palette.primary.main, 0.15);

  //  SELECTION HANDLERS
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectedIdsChange(e.target.checked ? orders.map((o) => o.id) : []);
  };

  const handleSelectOne = (id: number) => {
    onSelectedIdsChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  };

  //  PAGINATION HANDLERS 
  const handleChangePage = (event: unknown, newPage: number) => {
    onPaginationModelChange({ ...paginationModel, page: newPage });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onPaginationModelChange({
      ...paginationModel,
      pageSize: parseInt(event.target.value, 10),
      page: 0, // Reset to first page on page size change
    });
  };


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
            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
              backgroundColor: lightYellow,
            },
            "& .MuiTableBody-root .MuiTableRow-root:hover": {
              backgroundColor: hoverYellow,
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
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "#000000" : "#ffffff",
            }}
          >
            <TableRow sx={{ height: 60 }}>
              {view !== "dispatched" && (
                <TableCell padding="checkbox" sx={{ bgcolor: "inherit" }}>
                  <Checkbox
                    indeterminate={
                      selectedIds.length > 0 && selectedIds.length < orders.length
                    }
                    checked={
                      orders.length > 0 && selectedIds.length === orders.length
                    }
                    onChange={handleSelectAll}
                    sx={{ color: "inherit" }}
                  />
                </TableCell>
              )}
              {[
                "ACTIONS",
                "PRODUCT",
                "SALE ORDER NUMBER",
                "OUTBOUND DELIVERY",
                "REQUIRED DATE",
                "TRANSPORTER",
                "PAYMENT",
                "SALES ZONE",
                "PACKING CONFIG",
                "CUSTOMER",
                ...(view === "dispatched" ? ["LR NUMBER"] : []),
                "STATUS",
              ].filter((head) => !(view === "dispatched" && head === "ACTIONS"))
                .map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      color: (theme) =>
                        theme.palette.mode === "dark" ? "#ffffff" : "#000000",
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
                <TableCell colSpan={12} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((row) => (
                <TableRow key={row.id}>
                  {view !== "dispatched" && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleSelectOne(row.id)}
                      />
                    </TableCell>
                  )}
                  {view !== "dispatched" && (
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {(() => {
                        const rowIsAssigned = !!row.assignedUserId;
                        const rowIsRestricted = ["Under Issue", "Under Packing", "Dispatched"].includes(row.status || "");
                        const rowIsEditable = !rowIsAssigned && !rowIsRestricted;
                        return (
                          <>
                            <Tooltip title="Edit">
                              <Box component="span">
                                <IconButton size="small" disabled={!rowIsEditable} onClick={() => rowIsEditable && onEdit(row)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Tooltip>
                            <IconButton size="small" onClick={() => row.saleOrderNumber && onOpenChat(row.saleOrderNumber, row.id)}>
                              <Badge badgeContent={row.notificationCount || 0} color="error">
                                <ChatBubbleOutlineIcon fontSize="small" />
                              </Badge>
                            </IconButton>
                            <Tooltip title="Delete">
                              <Box component="span">
                                <IconButton size="small" disabled={rowIsAssigned || !!row.hasMaterialData} onClick={() => onDelete(row.id)} sx={{ color: "error.main" }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Tooltip>
                          </>
                        );
                      })()}
                    </TableCell>
                  )}

                  {/* PRODUCT */}
                  <TableCell>
                    {findName(lookup.products, row.productId)}
                  </TableCell>

                  {/* SALE ORDER NUMBER (LINK) */}
                  <TableCell>
                    <MuiLink
                      component={Link}
                      href={`/so-search/${row.saleOrderNumber}${row.outboundDelivery ? '/' + row.outboundDelivery : ''}`}
                      underline="hover"
                      sx={{ fontWeight: 500 }}
                    >
                      {row.saleOrderNumber}
                    </MuiLink>
                  </TableCell>

                  {/* OUTBOUND DELIVERY */}
                  <TableCell>{row.outboundDelivery}</TableCell>

                  {/* TRANSFER ORDER */}
                  {/* <TableCell>{row.transferOrder}</TableCell> */}

                  {/* DELIVERY DATE */}
                  <TableCell>
                    {row.deliveryDate ? formatDate(row.deliveryDate) : "-"}
                  </TableCell>

                  {/* TRANSPORTER */}
                  <TableCell>
                    {findName(lookup.transporters, row.transporterId)}
                  </TableCell>

                  {/* PLANT CODE */}
                  {/* <TableCell>
                    {row.plantCode || "-"}
                  </TableCell> */}

                  {/* PAYMENT */}
                  <TableCell>
                    {row.paymentClearance ? (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "3px 10px",
                          borderRadius: "16px",
                          border: "1px solid",
                          borderColor: alpha(theme.palette.success.main, 0.5),
                          backgroundColor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.mode === "dark" ? "#FFFFFF" : theme.palette.success.dark,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          minWidth: "50px",
                        }}
                      >
                        Yes
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "3px 10px",
                          borderRadius: "16px",
                          border: "1px solid",
                          borderColor: alpha(theme.palette.error.main, 0.5),
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                          color: theme.palette.mode === "dark" ? "#FFFFFF" : theme.palette.error.main,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          minWidth: "50px",
                        }}
                      >
                        No
                      </Box>
                    )}
                  </TableCell>

                  {/* SALES ZONE */}
                  <TableCell>
                    {findName(lookup.salesZones, row.salesZoneId)}
                  </TableCell>

                  {/* PACK CONFIG */}
                  <TableCell>
                    {findName(
                      lookup.packConfigs,
                      row.packConfigId,
                      "configName"
                    )}
                  </TableCell>

                  {/* CUSTOMER */}
                  <TableCell>
                    {row.customerNameText ||
                      (row.customerId != null
                        ? findName(
                          lookup.customers,
                          row.customerId ?? 0,
                          "name"
                        )
                        : "-")}
                  </TableCell>

                  {/* ADD LR NUMBER CELL */}
                  {view === "dispatched" && (
                    <TableCell>
                      {row.Dispatch_SO && row.Dispatch_SO.length > 0 
                        ? row.Dispatch_SO.map(d => d.LRnumber).filter(Boolean).join(", ") || "-" 
                        : "-"}
                    </TableCell>
                  )}

                  {/* SPECIAL REMARKS */}
                  {/* <TableCell>{row.specialRemarks || "-"}</TableCell> */}

                  {/* STATUS */}
                  <TableCell sx={{ minWidth: 100 }}>
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
                            color: theme.palette.mode === "dark" ? "#FFFFFF" : (colorMain === "#eab308" ? "#b45309" : colorMain),
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

      {/* PAGINATION */}
      <TablePagination
        component="div"
        count={totalOrders}
        page={paginationModel.page}
        onPageChange={handleChangePage}
        rowsPerPage={paginationModel.pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50, 100]}
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      />

    </Box>
  );
}