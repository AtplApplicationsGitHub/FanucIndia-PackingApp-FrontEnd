"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import AdminUsersTable from "./AdminUsersTable";
import AdminUserFormModal from "./AdminUserFormModal";
import { UserRole } from "@/types/admin";

const AdminManageUsersPanel: React.FC = () => {
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
  } = useAdminUsers();

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

  // Unified handler for both create and edit
  const handleSubmit = (
    data: { name: string; email: string; role: UserRole; password?: string },
    id?: number
  ) => {
    if (id) {
      // Editing existing user
      const updateData = { ...data };
      if (!updateData.password) delete updateData.password; // Don't send empty password
      updateUser(id, updateData);
    } else {
      // Creating new user
      if (!data.password) {
        // Should be caught by validation, but just in case
        return;
      }
      createUser(data as { name: string; email: string; role: UserRole; password: string });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Users</h2>
        <Button onClick={onCreate} className="gap-2">
          <Plus size={18} />
          New User
        </Button>
      </div>

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
    </div>
  );
};

export default AdminManageUsersPanel;
