import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Plus } from "lucide-react";
import { useAdminUsers } from "@/app/admin/components/hooks/useAdminUsers";
import AdminUsersTable from "@/app/admin/components/dashboard/UsersTable";
import AdminUserFormModal from "@/app/admin/components/dashboard/UserFormModal";
import { UserRole } from "@/app/admin/components/types/admin";

interface AdminManageUsersPanelProps {
  showSnackbar: (msg: string, severity: "success" | "error" | "info" | "warning") => void;
}

const AdminManageUsersPanel: React.FC<AdminManageUsersPanelProps> = ({ showSnackbar }) => {
  const {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    editingUser,
    setEditingUser,
    modalOpen,
    setModalOpen,
  } = useAdminUsers(showSnackbar);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const onEdit = (userId: number) => {
    const user = users.find((u) => u.id === userId) || null;
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSubmit = (
    data: { name: string; email: string; role: UserRole; password?: string },
    id?: number
  ) => {
    if (id) {
      const updateData = { ...data };
      if (!updateData.password) delete updateData.password;
      updateUser(id, updateData);
    } else {
      if (!data.password) return;
      createUser(data as { name: string; email: string; role: UserRole; password: string });
    }
  };

  return (
    <Box p={3} sx={{ width: "100%" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={4}
      >
        <Typography variant="h5" fontWeight={700}>
          Manage Users
        </Typography>
        <Button
          onClick={onCreate}
          startIcon={<Plus size={18} />}
          variant="text"
          type="button"
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark" ? "#e0e0e0" : "#222",
            bgcolor: "transparent",
            borderRadius: 0,
            px: 2.5,
            py: 1.25,
            textTransform: "none",
            "&:hover": {
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "grey.900" : "grey.100",
            },
            transition: "background 0.15s",
          }}
        >
          NEW USER
        </Button>
      </Stack>

      <AdminUsersTable
        users={users}
        loading={loading}
        onEdit={onEdit}
        onDelete={deleteUser}
      />

      <AdminUserFormModal
        open={modalOpen}
        setOpen={setModalOpen}
        onSubmit={handleSubmit}
        editingUser={editingUser}
      />
    </Box>
  );
};

export default AdminManageUsersPanel;
