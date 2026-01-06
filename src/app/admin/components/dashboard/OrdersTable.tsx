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
  Select,
  TextField,
  FormControl,
  Link as MuiLink,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
  Tooltip
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ArchiveIcon from "@mui/icons-material/Archive";
import Link from "next/link";
import { SalesOrder, Lookup } from "@/app/admin/components/types/admin";
import { findName, formatDate } from "@/app/admin/components/utils/admin";
import { useSoArchive } from "@/app/so-search/hooks/useSoArchive";
import ConfirmDeleteDialog from "@/common/components/ConfirmDeleteDialog";
import Badge from "@mui/material/Badge";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

type InlineEditField = "status" | "priority" | "assignedUserId" | "fgLocation";

type InlineEdit = {
  id: number;
  field: InlineEditField;
  value: string | number | null;
  original: string | number | null;
} | null;

type Props = {
  orders: SalesOrder[];
  lookup: Lookup;
  currentPage: number;
  pageSize: number;
  rowCount: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  onDelete: (id: number) => void;
  onUpdateInline: (
    id: number,
    field: InlineEditField,
    value: string | number | null
  ) => Promise<void>;
  loading: boolean;
  onEdit?: (order: SalesOrder) => void;
  onDetailedView: (order: SalesOrder) => void;
  onOpenChat: (soNumber: string, orderId: number) => void;
};

export default function AdminOrdersTable({
  orders,
  lookup,
  currentPage,
  pageSize,
  rowCount,
  setCurrentPage,
  setPageSize,
  onDelete,
  onUpdateInline,
  onEdit,
  onDetailedView,
  onOpenChat,
}: Props) {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25); 

  // --- INLINE EDIT STATE & LOGIC ---
  const [inlineEdit, setInlineEdit] = React.useState<InlineEdit>(null);

  const handleInlineSave = async (overrideValue?: string | number | null) => {
    if (!inlineEdit) return;

    const normalize = (
      field: InlineEditField,
      val: string | number | null | undefined
    ) => {
      if (field === "priority" || field === "assignedUserId") {
        if (val === "" || val === null || typeof val === "undefined")
          return null;
        const n = Number(val);
        return Number.isNaN(n) ? null : n;
      }
      return typeof val === "string" ? val.trim() : (val ?? "");
    };

    const next = normalize(inlineEdit.field, overrideValue ?? inlineEdit.value);
    const prev = normalize(inlineEdit.field, inlineEdit.original);

    const same = next === prev;

    if (same) {
      setInlineEdit(null);
      return;
    }

    await onUpdateInline(inlineEdit.id, inlineEdit.field, next ?? "");
    setInlineEdit(null);
  };

  // --- ARCHIVE LOGIC ---
  const {
    isLoading: isArchiveLoading,
    confirmAction,
    handleArchive,
    openConfirmation,
    closeConfirmation,
    soNumberToProcess,
  } = useSoArchive(() => {
    console.log("Archive successful, please refetch the data.");
  });

  // --- MENU LOGIC ---
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [menuRowId, setMenuRowId] = React.useState<number | null>(null);
  // We need to find the full row object for the currently open menu to pass to handlers
  const menuRow = React.useMemo(
    () => orders.find((o) => o.id === menuRowId),
    [orders, menuRowId]
  );

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    rowId: number
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuRowId(rowId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuRowId(null);
  };

  // --- PAGINATION HANDLERS ---
  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage + 1); // Convert 0-based to 1-based
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPageSize(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  // --- CUSTOM TEXT FIELD FOR EDITING ---
  function CustomEditTextField({
    initialValue,
    onCommit,
    onCancel,
    width,
    maxLength,
  }: {
    initialValue: string | number | null;
    onCommit: (val: string) => void;
    onCancel: () => void;
    width?: number | string;
    maxLength?: number;
  }) {
    const [localValue, setLocalValue] = React.useState(initialValue ?? "");

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") onCommit(localValue.toString());
      if (e.key === "Escape") onCancel();
      if (e.key === " " || (e.ctrlKey && e.key.toLowerCase() === "a")) {
        e.stopPropagation();
      }
    };

    return (
      <TextField
        value={localValue}
        size="small"
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onCommit(localValue.toString())}
        onKeyDown={handleKeyDown}
        autoFocus
        variant="standard"
        inputProps={maxLength ? { maxLength } : {}}
        sx={{ width: width ?? "100%" }}
      />
    );
  }

  const isAssigned = !!menuRow?.assignedUserId;

  return (
    <Box sx={{ width: "100%", borderRadius: 2, overflow: "hidden" }}>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
        <Table
          sx={{
            minWidth: 650,
            // Zebra striping logic:
            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd)": {
              backgroundColor: lightYellow,
            },
            "& .MuiTableBody-root .MuiTableRow-root:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            },
            // Remove all borders
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
              bgcolor: (theme) => theme.palette.mode === "dark" ? "#000000" : "#ffffff",
            }}
          >
            <TableRow sx={{ height: 60 }}>
              {[
                "Actions",
                "Notifications",
                "User Name",
                "Product",
                "Sale Order Number",
                "Out Bound Delivery",
                "Transfer Order",
                "Required Date",
                "Payment",
                "Sales Zone",
                // "Packing Config",
                "Customer",
                "Status",
                "Priority",
                "Assigned User",
                // "Special Remarks",
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
            {orders.map((row) => {
              const isDispatched = row.status === "Dispatched";
              const isAssignedUserLocked = isDispatched || row.status === "F105";

              return(
              <TableRow key={row.id}>
                {/* ACTIONS */}
                <TableCell>
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, row.id)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>

                <TableCell>
                     <IconButton 
                       onClick={() => row.saleOrderNumber && onOpenChat(row.saleOrderNumber, row.id)}
                       size="small"
                     >
                       <Badge badgeContent={row.notificationCount || 0} color="error">
                         <ChatBubbleOutlineIcon fontSize="small" />
                       </Badge>
                     </IconButton>
                  </TableCell>

                {/* USER NAME */}
                <TableCell>{row.user?.name || "-"}</TableCell>

                {/* PRODUCT */}
                <TableCell>
                  {findName(lookup.products, row.productId ?? 0)}
                </TableCell>

                {/* SO NUMBER (LINK) */}
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

                {/* PAYMENT */}
                <TableCell>
                  {row.paymentClearance ? "Yes" : "No"}
                </TableCell>

                {/* SALES ZONE */}
                <TableCell>
                  {findName(lookup.salesZones, row.salesZoneId ?? 0)}
                </TableCell>

                {/* PACK CONFIG */}
                {/* <TableCell>
                  {findName(
                    lookup.packConfigs,
                    row.packConfigId ?? 0,
                    "configName"
                  )}
                </TableCell> */}

                {/* CUSTOMER */}
                <TableCell>
                  {row.customerNameText || findName(lookup.customers, row.customerId ?? 0, "name")}
                </TableCell>

                <TableCell sx={{ minWidth: 100 }}>
                  <Box>
                    {row.status || "-"}
                  </Box>
                </TableCell>

                {/* PRIORITY (INLINE EDIT) */}
                <TableCell sx={{ minWidth: 80 }}>
                  {inlineEdit?.id === row.id && inlineEdit.field === "priority" ? (
                    <CustomEditTextField
                      initialValue={inlineEdit.value}
                      onCommit={(val) => handleInlineSave(val)}
                      onCancel={() => setInlineEdit(null)}
                    />
                  ) : (
                    <Box
                      sx={{
                        cursor: isDispatched ? "default" : "pointer",
                        textDecoration: isDispatched ? "none" : "underline dotted",
                      }}
                      onClick={() =>
                        !isDispatched &&
                        setInlineEdit({
                          id: row.id,
                          field: "priority",
                          value:
                            row.priority !== undefined && row.priority !== null
                              ? row.priority
                              : "",
                          original: row.priority ?? "",
                        })
                      }
                      title={isDispatched ? "Locked (Dispatched)" : "Click to edit priority"}
                    >
                      {row.priority ?? "-"}
                    </Box>
                  )}
                </TableCell>

                {/* ASSIGNED USER (INLINE EDIT - SELECT) */}
                <TableCell sx={{ minWidth: 150 }}>
                    {inlineEdit?.id === row.id &&
                    inlineEdit.field === "assignedUserId" ? (
                      <FormControl variant="standard" size="small" fullWidth>
                        <Select
                          value={inlineEdit.value ?? ""}
                          onChange={(e) => {
                            const selected =
                              e.target.value === "" ? null : Number(e.target.value);
                            handleInlineSave(selected);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === " " || (e.ctrlKey && e.key.toLowerCase() === "a")) {
                              e.stopPropagation();
                            }
                          }}
                          autoFocus
                        >
                          <MenuItem value="">
                            <em>Unassigned</em>
                          </MenuItem>
                          {lookup.assignableUsers.map((u) => (
                            <MenuItem key={u.id} value={u.id}>
                              {u.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Box
                        sx={{
                          cursor: isAssignedUserLocked ? "default" : "pointer",
                          textDecoration: isAssignedUserLocked ? "none" : "underline dotted",
                        }}
                        onClick={() =>
                          !isAssignedUserLocked &&
                          setInlineEdit({
                            id: row.id,
                            field: "assignedUserId",
                            value: row.assignedUserId ?? "",
                            original: row.assignedUserId ?? "",
                          })
                        }
                        title={isAssignedUserLocked ? "Locked (Packed/Dispatched)" : "Click to assign user"}
                      >
                        {row.assignedUser?.name ||
                          findName(lookup.assignableUsers, row.assignedUserId ?? 0) ||
                          "-"}
                      </Box>
                    )}
                  </TableCell>

                {/* SPECIAL REMARKS */}
                {/* <TableCell>{row.specialRemarks || "-"}</TableCell> */}
              </TableRow>
              );
            })}

            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={18} align="center" sx={{ py: 4 }}>
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <TablePagination
        component="div"
        count={rowCount}
        page={currentPage - 1} // 0-based index for MUI
        onPageChange={handleChangePage}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50, 100]}
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      />

      {/* MENU */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Tooltip title={isAssigned ? "Order assigned" : ""}>
          <Box>
            <MenuItem 
              onClick={() => {
                if (menuRow) onEdit?.(menuRow);
                handleMenuClose();
              }}
              disabled={isAssigned || menuRow?.status === "Dispatched"}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
          </Box>
        </Tooltip>

        <MenuItem
          onClick={() => {
            if (menuRowId) onDelete(menuRowId);
            handleMenuClose();
          }}
          sx={{
            color: menuRow?.hasMaterialData ? "text.disabled" : "error.main",
          }}
          disabled={menuRow?.hasMaterialData || isAssigned || menuRow?.status === "Dispatched"}
        >
          <ListItemIcon sx={{ color: "inherit" }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (menuRow) onDetailedView(menuRow);
            handleMenuClose();
          }}
          disabled={menuRow?.status === "Dispatched"}
        >
          <ListItemIcon>
            <OpenInNewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Detailed View</ListItemText>
        </MenuItem>

        {menuRow?.status === "Dispatched" && (
          <MenuItem
            onClick={() => {
              if (menuRow.saleOrderNumber) {
                openConfirmation("archive", menuRow.saleOrderNumber);
              }
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <ArchiveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Archive data</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* CONFIRM DIALOG */}
      <ConfirmDeleteDialog
        open={confirmAction === "archive"}
        onCancel={closeConfirmation}
        onConfirm={handleArchive}
        title="Confirm Archive"
        description={`Are you sure you want to archive Sales Order ${soNumberToProcess}? This will move the data to archives.`}
        loading={isArchiveLoading}
      />
    </Box>
  );
}