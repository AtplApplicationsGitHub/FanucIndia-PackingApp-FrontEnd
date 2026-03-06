import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Plus } from "lucide-react";
import { useAdminUsers } from "@/app/admin/components/hooks/useAdminUsers";
import AdminUsersTable from "@/app/admin/components/dashboard/UsersTable";
import AdminUserFormModal, { UserSubmitData } from "@/app/admin/components/dashboard/UserFormModal"; // Import UserSubmitData

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

  // Update signature to use UserSubmitData
  const handleSubmit = (data: UserSubmitData, id?: number) => {
    if (id) {
      const updateData = { ...data };
      if (!updateData.password) delete updateData.password;
      updateUser(id, updateData);
    } else {
      if (!data.password) return;
      // We know password is present here because validation in Modal ensures it
      createUser(data as UserSubmitData & { password: string }); 
    }
  };

  return (
    <Box p={0} sx={{ width: "100%" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        mb={1}
      >
        <Button
          onClick={onCreate}
          startIcon={<Plus size={18} />}
          sx={{
            bgcolor: (theme) => theme.palette.action.hover,
            color: (theme) => theme.palette.text.primary,
            borderRadius: 0,
            clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
            fontWeight: 600,
            fontSize: 15,
            minWidth: 120,
            height: 40,
            px: 3,
            textTransform: "none",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              bgcolor: (theme) => theme.palette.primary.main,
              color: (theme) => theme.palette.primary.contrastText,
              boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
              "& .MuiSvgIcon-root, & svg": {
                color: "#000",
              },
            },
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