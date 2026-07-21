"use client";

import * as React from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
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
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Pencil, Trash2 } from "lucide-react";
import { User } from "@/app/admin/components/types/admin";
import ConfirmDeleteDialog from "@/common/components/ConfirmDeleteDialog";
import { formatDateTimeIST } from "@/common/utils/dateTime";

interface Props {
  users: User[];
  loading: boolean;
  onEdit: (userId: number) => void;
  onDelete: (userId: number) => Promise<void> | void;
  currentUserId?: number;
}

const AdminUsersTable: React.FC<Props> = ({
  users,
  loading,
  onEdit,
  onDelete,
  currentUserId,
}) => {
  const theme = useTheme();
  const lightYellow = alpha(theme.palette.primary.main, 0.25);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = React.useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [pendingDeleteUserId, setPendingDeleteUserId] = React.useState<
    number | null
  >(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // Pagination State
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    rowId: number,
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate visible rows for the current page
  const visibleRows = React.useMemo(
    () => users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [users, page, rowsPerPage],
  );

  return (
    <Box sx={{ width: "100%" }}>
      {/* 1. UNIFIED PAPER WRAPPER (Matches LookupCrudTable) */}
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  Email
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  Role
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  Zone
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  Created
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    width: 100,
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      // Alternating row colors matching LookupCrudTable
                      backgroundColor:
                        index % 2 === 1
                          ? alpha(theme.palette.primary.main, 0.2)
                          : "inherit",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.action.hover,
                          0.05,
                        ),
                      },
                    }}
                  >
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {row.role.replace(/_/g, " ").toLowerCase()}
                    </TableCell>
                    <TableCell>{row.salesZone?.name ?? "-"}</TableCell>
                    <TableCell>
                      {row.createdAt ? formatDateTimeIST(row.createdAt) : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, row.id)}
                        size="small"
                        aria-label="actions"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 2. PAGINATION NOW INSIDE THE PAPER WRAPPER */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Menus and Dialogs remain exactly the same */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
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
            if (menuRowId) onEdit(menuRowId);
            handleMenuClose();
          }}
        >
          <Pencil size={16} style={{ marginRight: 10 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRowId) handleDeleteClick(menuRowId);
          }}
          sx={{ color: "error.main" }}
          disabled={menuRowId === currentUserId}
        >
          <Trash2 size={16} style={{ marginRight: 10 }} />
          {menuRowId === currentUserId ? "Cannot Delete Self" : "Delete"}
        </MenuItem>
      </Menu>

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