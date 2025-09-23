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
  Link as MuiLink,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { ListItemIcon, ListItemText } from "@mui/material";
import { SalesOrder, Lookup } from "@/app/admin/components/types/admin";
import { findName, formatDate } from "@/app/admin/components/utils/admin";
import Link from "next/link";

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
  onDetailedView,
}: Props) {
  const [inlineEdit, setInlineEdit] = React.useState<InlineEdit>(null);

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
      // text fields
      return typeof val === "string" ? val.trim() : (val ?? "");
    };

    const next = normalize(inlineEdit.field, overrideValue ?? inlineEdit.value);
    const prev = normalize(inlineEdit.field, inlineEdit.original);

    // If nothing changed, just close edit and do nothing.
    const same =
      typeof next === "string" && typeof prev === "string"
        ? next === prev
        : next === prev;

    if (same) {
      setInlineEdit(null);
      return;
    }

    await onUpdateInline(inlineEdit.id, inlineEdit.field, next ?? "");
    setInlineEdit(null);
  };

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
      // prevent DataGrid from hijacking text-edit keys
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
        slotProps={{
          htmlInput: maxLength ? { maxLength } : {},
        }}
        sx={{ width: width ?? "100%" }}
      />
    );
  }

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
                <div>
                  <MenuItem
                    onClick={() => {
                      onDelete(row.id);
                      handleMenuClose();
                    }}
                    sx={{ color: row.hasMaterialData ? "text.disabled" : "error.main" }}
                    disabled={row.hasMaterialData}
                  >
                    <ListItemIcon sx={{ color: "inherit" }}>
                      <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                  </MenuItem>
                </div>
              <MenuItem
                onClick={() => {
                  onDetailedView(row);
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
      renderCell: (params: GridRenderCellParams<SalesOrder>) => (
        <MuiLink
          component={Link}
          href={`/so-search/${params.row.saleOrderNumber}`}
          underline="hover"
          sx={{ fontWeight: 500 }}
        >
          {params.value}
        </MuiLink>
      ),
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
          // inside the "status" column renderCell, replace the editor JSX with:
          <CustomEditTextField
            initialValue={inlineEdit.value}
            onCommit={(val) => handleInlineSave(val)} // ✅ commit with override
            onCancel={() => setInlineEdit(null)}
            width={80}
            maxLength={32}
          />
        ) : (
          <Box
            sx={{ cursor: "pointer", textDecoration: "underline dotted" }}
            onClick={() =>
              setInlineEdit({
                id: row.id,
                field: "status",
                value: row.status || "",
                original: row.status || "",
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
          // inside the "priority" column renderCell, replace the editor JSX with:
          <CustomEditTextField
            initialValue={inlineEdit.value}
            onCommit={(val) => handleInlineSave(val)} // ✅ commit with override
            onCancel={() => setInlineEdit(null)}
            width={65}
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
                original: row.priority ?? "",
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
      field: "assignedUserId",
      headerName: "Assigned User",
      width: 150,
      renderCell: (params: GridRenderCellParams<SalesOrder>) => {
        const row = params.row;

        return inlineEdit &&
          inlineEdit.id === row.id &&
          inlineEdit.field === "assignedUserId" ? (
          <FormControl variant="standard" size="small" sx={{ minWidth: 120 }}>
            <Select
              value={inlineEdit.value ?? ""}
              onChange={(e) => {
                const selected =
                  e.target.value === "" ? null : Number(e.target.value);
                handleInlineSave(selected);
              }}
              onKeyDown={(e) => {
                if (
                  e.key === " " ||
                  (e.ctrlKey && e.key.toLowerCase() === "a")
                ) {
                  e.stopPropagation();
                }
              }}
              autoFocus
            >
              <MenuItem value="">
                <em>Unassigned</em>
              </MenuItem>
              {/* assignableUsers is already filtered by role=user from the backend */}
              {lookup.assignableUsers.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}
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
                field: "assignedUserId",
                value: row.assignedUserId ?? "",
                original: row.assignedUserId ?? "",
              })
            }
            title="Click to edit"
          >
            {row.assignedUser?.name ||
              findName(lookup.assignableUsers, row.assignedUserId ?? 0) ||
              "-"}
          </Box>
        );
      },
    },
    {
      field: "fgLocation",
      headerName: "FG Location",
      width: 120,
      renderCell: (params: GridRenderCellParams<SalesOrder>) => {
        const row = params.row;
        return inlineEdit &&
          inlineEdit.id === row.id &&
          inlineEdit.field === "fgLocation" ? (
          // inside the "fgLocation" column renderCell, replace the editor JSX with:
          <CustomEditTextField
            initialValue={inlineEdit.value}
            onCommit={(val) => handleInlineSave(val)} // ✅ commit with override
            onCancel={() => setInlineEdit(null)}
            width="100%"
            maxLength={100}
          />
        ) : (
          <Box
            sx={{
              cursor: "pointer",
              textDecoration: "underline dotted",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            onClick={() =>
              setInlineEdit({
                id: row.id,
                field: "fgLocation",
                value: row.fgLocation || "",
                original: row.fgLocation || "",
              })
            }
            title={row.fgLocation || "Click to edit"}
          >
            {row.fgLocation || "-"}
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
    <Box
      sx={{
        width: "100%",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
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