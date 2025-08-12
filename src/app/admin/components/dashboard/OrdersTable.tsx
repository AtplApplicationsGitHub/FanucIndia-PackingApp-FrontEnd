"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  IconButton,
  Menu,
  MenuItem,
  Select,
  TextField,
  FormControl,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { ListItemIcon, ListItemText } from "@mui/material";
import { useRouter } from "next/navigation";
import { SalesOrder, Lookup } from "@/app/admin/components/types/admin";
import { findName, formatDate } from "@/app/admin/components/utils/admin";

type InlineEditField = "status" | "priority" | "terminalId";
type InlineEdit = {
  id: number;
  field: InlineEditField;
  value: string | number | null;
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
  loading,
  onEdit,
}: Props) {
  const [inlineEdit, setInlineEdit] = React.useState<InlineEdit>(null);

  const router = useRouter();

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [menuRowId, setMenuRowId] = React.useState<number | null>(null);

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

  const handleInlineSave = async () => {
    if (inlineEdit) {
      let value = inlineEdit.value;
      if (
        inlineEdit.field === "priority" ||
        inlineEdit.field === "terminalId"
      ) {
        value = value === "" || value === null ? null : Number(value);
      }
      await onUpdateInline(inlineEdit.id, inlineEdit.field, value ?? "");
      setInlineEdit(null);
    }
  };

  const columns: GridColDef<SalesOrder>[] = [
    {
      field: "actions",
      headerName: "Actions",
      width: 65,
      sortable: false,
      renderCell: (params: GridRenderCellParams<SalesOrder>) => {
        const row = params.row;
        return (
          <Box>
            <IconButton
              onClick={(e) => handleMenuOpen(e, row.id)}
              size="small"
              aria-label="actions"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl) && menuRowId === row.id}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem
                onClick={() => {
                  onEdit?.(row);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onDelete(row.id);
                  handleMenuClose();
                }}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon sx={{ color: "inherit" }}>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  router.push(`/admin/material-data/${row.id}`);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <OpenInNewIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Detailed View</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        );
      },
    },
    {
      field: "user",
      headerName: "User Name",
      width: 120,
      valueGetter: (_value, row) => row.user?.name || "-",
    },
    {
      field: "productId",
      headerName: "Product",
      width: 110,
      valueGetter: (_value, row) =>
        findName(lookup.products, row.productId ?? 0),
    },
    {
      field: "saleOrderNumber",
      headerName: "Sale Order Number",
      width: 120,
    },
    {
      field: "outboundDelivery",
      headerName: "Out Bound Delivery",
      width: 130,
    },
    {
      field: "transferOrder",
      headerName: "Transfer Order",
      width: 110,
    },
    {
      field: "deliveryDate",
      headerName: "Required Date of Delivery",
      width: 130,
      valueGetter: (_value, row) =>
        row.deliveryDate ? formatDate(row.deliveryDate) : "-",
    },
    {
      field: "transporterId",
      headerName: "Transporter",
      width: 120,
      valueGetter: (_value, row) =>
        findName(lookup.transporters, row.transporterId ?? 0),
    },
    {
      field: "plantCodeId",
      headerName: "Delivery Plant Code",
      width: 130,
      valueGetter: (_value, row) =>
        findName(lookup.plantCodes, row.plantCodeId ?? 0, "code"),
    },
    {
      field: "paymentClearance",
      headerName: "Payment Clearance",
      width: 110,
      valueGetter: (_value, row) => (row.paymentClearance ? "Yes" : "No"),
    },
    {
      field: "salesZoneId",
      headerName: "Sales Zone",
      width: 110,
      valueGetter: (_value, row) =>
        findName(lookup.salesZones, row.salesZoneId ?? 0),
    },
    {
      field: "packConfigId",
      headerName: "Packing Configuration",
      width: 130,
      valueGetter: (_value, row) =>
        findName(lookup.packConfigs, row.packConfigId ?? 0, "configName"),
    },
    {
      field: "customerId",
      headerName: "Customer",
      width: 120,
      valueGetter: (_value, row) =>
        findName(lookup.customers, row.customerId ?? 0, "name"),
    },
    {
      field: "status",
      headerName: "Status",
      width: 80,
      renderCell: (params: GridRenderCellParams<SalesOrder>) => {
        const row = params.row;
        return inlineEdit &&
          inlineEdit.id === row.id &&
          inlineEdit.field === "status" ? (
          <TextField
            value={inlineEdit.value ?? ""}
            size="small"
            onChange={(e) =>
              setInlineEdit({ ...inlineEdit, value: e.target.value })
            }
            onBlur={handleInlineSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInlineSave();
              if (e.key === "Escape") setInlineEdit(null);
            }}
            autoFocus
            variant="standard"
            slotProps={{
              htmlInput: { maxLength: 32 },
            }}
            sx={{ width: 80 }}
          />
        ) : (
          <Box
            sx={{ cursor: "pointer", textDecoration: "underline dotted" }}
            onClick={() =>
              setInlineEdit({
                id: row.id,
                field: "status",
                value: row.status || "",
              })
            }
            title="Click to edit"
          >
            {row.status || "-"}
          </Box>
        );
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 80,
      renderCell: (params: GridRenderCellParams<SalesOrder>) => {
        const row = params.row;
        return inlineEdit &&
          inlineEdit.id === row.id &&
          inlineEdit.field === "priority" ? (
          <TextField
            value={inlineEdit.value ?? ""}
            type="number"
            size="small"
            onChange={(e) =>
              setInlineEdit({ ...inlineEdit, value: e.target.value })
            }
            onBlur={handleInlineSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInlineSave();
              if (e.key === "Escape") setInlineEdit(null);
            }}
            autoFocus
            variant="standard"
            sx={{ width: 65 }}
          />
        ) : (
          <Box
            sx={{ cursor: "pointer", textDecoration: "underline dotted" }}
            onClick={() =>
              setInlineEdit({
                id: row.id,
                field: "priority",
                value:
                  row.priority !== undefined && row.priority !== null
                    ? row.priority
                    : "",
              })
            }
            title="Click to edit"
          >
            {row.priority ?? "-"}
          </Box>
        );
      },
    },
    {
      field: "terminalId",
      headerName: "Terminal",
      width: 110,
      renderCell: (params: GridRenderCellParams<SalesOrder>) => {
        const row = params.row;
        return inlineEdit &&
          inlineEdit.id === row.id &&
          inlineEdit.field === "terminalId" ? (
          <FormControl variant="standard" size="small" sx={{ minWidth: 80 }}>
            <Select
              value={inlineEdit.value ?? ""}
              onChange={(e) =>
                setInlineEdit({ ...inlineEdit, value: Number(e.target.value) })
              }
              onBlur={handleInlineSave}
              autoFocus
            >
              <MenuItem value="">Select</MenuItem>
              {lookup.terminals.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Box
            sx={{ cursor: "pointer", textDecoration: "underline dotted" }}
            onClick={() =>
              setInlineEdit({
                id: row.id,
                field: "terminalId",
                value: row.terminalId ?? "",
              })
            }
            title="Click to edit"
          >
            {row.terminal?.name ||
              findName(lookup.terminals, row.terminalId ?? 0) ||
              "-"}
          </Box>
        );
      },
    },
    {
      field: "specialRemarks",
      headerName: "SpecialRemarks",
      width: 120,
      valueGetter: (_value, row) => row.specialRemarks || "-",
    },
  ];

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <DataGrid
        rows={orders}
        columns={columns}
        getRowId={(row) => row.id}
        pageSizeOptions={[5, 10, 25, 50]}
        paginationModel={{ page: currentPage - 1, pageSize }}
        onPaginationModelChange={({ page, pageSize }) => {
          setCurrentPage(page + 1);
          setPageSize(pageSize);
        }}
        rowCount={rowCount}
        pagination
        paginationMode="server"
        loading={loading}
        sx={{
          border: "none",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "rgba(0,0,0,0.04)",
            fontWeight: 600,
          },
          "& .MuiDataGrid-cell": {
            lineHeight: 1.3,
            py: 1,
          },
        }}
      />
    </Box>
  );
}
