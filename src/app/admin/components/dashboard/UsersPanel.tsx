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
  usersState: ReturnType<typeof useAdminUsers>;
}

const AdminManageUsersPanel: React.FC<AdminManageUsersPanelProps> = ({ showSnackbar, usersState }) => {
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
  } = usersState;

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onEdit = (userId: number) => {
    const user = users.find((u) => u.id === userId) || null;
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSubmit = (data: UserSubmitData, id?: number) => {
    if (id) {
      const updateData = { ...data };
      if (!updateData.password) delete updateData.password;
      updateUser(id, updateData);
    } else {
      if (!data.password) return;
      createUser(data as UserSubmitData & { password: string }); 
    }
  };

  return (
    <Box p={0} sx={{ width: "100%" }}>
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