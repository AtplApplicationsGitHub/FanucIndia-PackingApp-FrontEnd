"use client";

import * as React from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { User } from "@/app/admin/components/types/admin";
import ConfirmDeleteDialog from "@/common/components/ConfirmDeleteDialog";

interface Props {
  users: User[];
  loading: boolean;
  onEdit: (userId: number) => void;
  onDelete: (userId: number) => Promise<void> | void;
  currentUserId?: number;
}

const AdminUsersTable: React.FC<Props> = ({
  users,
  onEdit,
  onDelete,
  currentUserId,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = React.useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [pendingDeleteUserId, setPendingDeleteUserId] = React.useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    rowId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuRowId(rowId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRowId(null);
  };

  const handleDeleteClick = (userId: number) => {
    setPendingDeleteUserId(userId);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogCancel = () => {
    setDeleteDialogOpen(false);
    setPendingDeleteUserId(null);
    setDeleteLoading(false);
  };

  const handleDialogConfirm = async () => {
    if (pendingDeleteUserId != null) {
      setDeleteLoading(true);
      await Promise.resolve(onDelete(pendingDeleteUserId));
      setDeleteDialogOpen(false);
      setPendingDeleteUserId(null);
      setDeleteLoading(false);
    }
  };

  const columns: GridColDef<User>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 190,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<User>) => (
        <span style={{ textTransform: "capitalize" }}>
          {params.value as string}
        </span>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 1,
      minWidth: 140,
      valueGetter: (_value, row) =>
        row.createdAt ? format(new Date(row.createdAt), "dd MMM yyyy") : "-",
    },
    {
      field: "actions",
      headerName: "",
      sortable: false,
      width: 64,
      align: "center",
      renderCell: (params: GridRenderCellParams<User>) => {
        const row = params.row as User;
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
              anchorEl={anchorEl}
              open={Boolean(anchorEl) && menuRowId === row.id}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem
                onClick={() => {
                  onEdit(row.id);
                  handleMenuClose();
                }}
              >
                <Pencil size={16} style={{ marginRight: 10 }} /> Edit
              </MenuItem>
              <MenuItem
                onClick={() => handleDeleteClick(row.id)}
                sx={{ color: "error.main" }}
                disabled={row.id === currentUserId}
              >
                <Trash2 size={16} style={{ marginRight: 10 }} />
                {row.id === currentUserId ? "Cannot Delete Self" : "Delete"}
              </MenuItem>
            </Menu>
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={users}
        columns={columns}
        getRowId={(row) => row.id}
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
        disableRowSelectionOnClick
        sx={{
          border: "none",
          bgcolor: "background.paper",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "rgba(0,0,0,0.04)",
            fontWeight: 600,
          },
          "& .MuiDataGrid-cell": {
            py: 1,
            lineHeight: 1.3,
          },
        }}
        localeText={{
          noRowsLabel: (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
              No users found.
            </Typography>
          ) as unknown as string,
        }}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
        loading={deleteLoading}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
      />
    </Box>
  );
};

export default AdminUsersTable;
