import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import {
  useAdminUsers,
  UserRoleFilter,
} from "@/app/admin/components/hooks/useAdminUsers";
import AdminUsersTable from "@/app/admin/components/dashboard/UsersTable";
import AdminUserFormModal, {
  UserSubmitData,
} from "@/app/admin/components/dashboard/UserFormModal";

interface AdminManageUsersPanelProps {
  showSnackbar: (
    msg: string,
    severity: "success" | "error" | "info" | "warning",
  ) => void;
  usersState: ReturnType<typeof useAdminUsers>;
  searchQuery: string; // <--- ADDED: Listens to the Toolbar in LookupPanel
  roleFilter?: UserRoleFilter; // Toolbar toggle "Show Terminal Operators only" -> "USER"
}

const AdminManageUsersPanel: React.FC<AdminManageUsersPanelProps> = ({
  showSnackbar,
  usersState,
  searchQuery, // <--- ADDED
  roleFilter,
}) => {
  // REMOVED: local inputValue and search states

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

  // UPDATED: Now fetches users based on the centralized Toolbar search
  // + role filter of the "Show Terminal Operators only" toggle
  useEffect(() => {
    fetchUsers(searchQuery, roleFilter);
  }, [fetchUsers, searchQuery, roleFilter]);

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
      {/* REMOVED: The entire <Stack> with the duplicate search and button */}

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
