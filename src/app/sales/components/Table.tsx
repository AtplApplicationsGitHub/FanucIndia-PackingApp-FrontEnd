import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from "@mui/x-data-grid";
import { SalesOrder, LookupData } from "@/app/sales/components/types/sales";
import { findName, formatDate } from "@/app/sales/components/utils/sales";
import { IconButton, Menu, MenuItem, Link as MuiLink, Tooltip } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Link from "next/link"; 

type Props = {
  orders: SalesOrder[];
  lookup: LookupData;
  totalOrders: number;
  onEdit: (order: SalesOrder) => void;
  onDelete: (id: number) => void;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
};

function ActionsCell({
  row,
  onEdit,
  onDelete,
}: {
  row: SalesOrder;
  onEdit: (order: SalesOrder) => void;
  onDelete: (id: number) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const isAssigned = !!row.assignedUserId;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(row);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(row.id);
    handleMenuClose();
  };

  return (
    <Box>
      <IconButton onClick={handleMenuOpen} size="small">
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Tooltip title={isAssigned ? "This order is assigned and cannot be edited or deleted." : ""}>
          <div>
            <MenuItem onClick={handleEdit} disabled={isAssigned}>Edit</MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: "error.main" }} disabled={isAssigned}>
              Delete
            </MenuItem>
          </div>
        </Tooltip>
      </Menu>
    </Box>
  );
}

export default function SalesOrdersTable({
  orders,
  lookup,
  totalOrders,
  onEdit,
  onDelete,
  paginationModel,
  onPaginationModelChange,
}: Props) {
  const columns: GridColDef<SalesOrder>[] = [
    {
      field: "actions",
      headerName: "Actions",
      width: 70,
      sortable: false,
      renderCell: (params) => (
        <ActionsCell
          row={params.row as SalesOrder}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
    {
      field: "productId",
      headerName: "Product",
      width: 110,
      valueGetter: (_value, row) => findName(lookup.products, row.productId),
    },
    {
      field: "saleOrderNumber",
      headerName: "Sale Order Number",
      width: 110,
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
    { field: "outboundDelivery", headerName: "OutBound Delivery", width: 110 },
    { field: "transferOrder", headerName: "Transfer Order", width: 110 },
    {
      field: "deliveryDate",
      headerName: "Required Date of Delivery",
      width: 110,
      valueGetter: (_value, row) =>
        row.deliveryDate ? formatDate(row.deliveryDate) : "-",
    },
    {
      field: "transporterId",
      headerName: "Transporter",
      width: 110,
      valueGetter: (_value, row) =>
        findName(lookup.transporters, row.transporterId),
    },
    {
      field: "plantCodeId",
      headerName: "Plant Code",
      width: 110,
      valueGetter: (_value, row) =>
        findName(lookup.plantCodes, row.plantCodeId, "code"),
    },
    {
      field: "paymentClearance",
      headerName: "Payment Clearance",
      width: 100,
      valueGetter: (_value, row) => (row.paymentClearance ? "Yes" : "No"),
    },
    {
      field: "salesZoneId",
      headerName: "Sales Zone",
      width: 110,
      valueGetter: (_value, row) =>
        findName(lookup.salesZones, row.salesZoneId),
    },
    {
      field: "packConfigId",
      headerName: "Packing Configuration",
      width: 110,
      valueGetter: (_value, row) =>
        findName(lookup.packConfigs, row.packConfigId, "configName"),
    },
    {
      field: "customerId",
      headerName: "Customer",
      width: 110,
      valueGetter: (_value, row) =>
        findName(lookup.customers, row.customerId, "name"),
    },
    {
      field: "specialRemarks",
      headerName: "Special Remarks",
      width: 160,
      valueGetter: (_value, row) => row.specialRemarks || "-",
    },
    {
      field: "status",
      headerName: "Status",
      width: 80,
    },
  ];

  return (
    <Box sx={{ 
        width: "100%", 
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden'
    }}>
      <DataGrid
        rows={orders}
        columns={columns}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        rowCount={totalOrders}
        paginationMode="server"
        pageSizeOptions={[5, 10, 25, 50]}
        sx={{
          border: "none",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "rgba(0,0,0,0.04)",
            fontWeight: 600,
          },
        }}
      />
    </Box>
  );
}