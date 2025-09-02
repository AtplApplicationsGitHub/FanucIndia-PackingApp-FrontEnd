"use client";

import * as React from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Eye } from "lucide-react";
import { SalesOrder } from "@/app/admin/components/types/admin";

interface Props {
  orders: SalesOrder[];
  loading: boolean;
  onDetailedView: (order: SalesOrder) => void; // 👈 Add this prop
}

const AssignedOrdersTable: React.FC<Props> = ({ orders, loading, onDetailedView }) => {

  const handleViewDetails = (order: SalesOrder) => { // 👈 Change parameter to the whole order object
    onDetailedView(order); // 👈 Call the prop function
  };

  const columns: GridColDef<SalesOrder>[] = [
    {
      field: "actions",
      headerName: "Action",
      width: 80,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams<SalesOrder>) => (
        <Tooltip title="View Details">
          <IconButton
            onClick={() => handleViewDetails(params.row)} // 👈 Pass the full row object
            size="small"
          >
            <Eye size={18} />
          </IconButton>
        </Tooltip>
      ),
    },
    // ... (the rest of the columns remain the same)
    {
      field: "product",
      headerName: "Product",
      flex: 1,
      minWidth: 150,
      valueGetter: (_value, row) => row.product?.name || "-",
    },
    {
      field: "saleOrderNumber",
      headerName: "Sale Order Number",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "outboundDelivery",
      headerName: "Outbound Delivery",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "transferOrder",
      headerName: "Transfer Order",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "packConfig",
      headerName: "Packing Configuration",
      flex: 1,
      minWidth: 180,
      valueGetter: (_value, row) => row.packConfig?.configName || "-",
    },
    {
      field: "specialRemarks",
      headerName: "Special Remarks",
      flex: 1.5,
      minWidth: 200,
      valueGetter: (_value, row) => row.specialRemarks || "-",
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      valueGetter: (_value, row) => row.status || "-",
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={orders}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        disableRowSelectionOnClick
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
};

export default AssignedOrdersTable;