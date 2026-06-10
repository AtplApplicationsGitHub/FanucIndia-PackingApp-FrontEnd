import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Plus } from "lucide-react";
import { useAdminUsers } from "@/app/admin/components/hooks/useAdminUsers";
import AdminUsersTable from "@/app/admin/components/dashboard/UsersTable";
import AdminUserFormModal, {
  UserSubmitData,
} from "@/app/admin/components/dashboard/UserFormModal";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { Search } from "lucide-react";
import CommonButton from "@/common/components/CommonButton";

interface AdminManageUsersPanelProps {
  showSnackbar: (
    msg: string,
    severity: "success" | "error" | "info" | "warning",
  ) => void;
  usersState: ReturnType<typeof useAdminUsers>;
}

const AdminManageUsersPanel: React.FC<AdminManageUsersPanelProps> = ({
  showSnackbar,
  usersState,
}) => {
  const [inputValue, setInputValue] = React.useState("");
  const [search, setSearch] = React.useState("");
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
    fetchUsers(search);
  }, [fetchUsers, search]);

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
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 2, justifyContent: "center" }}
        alignItems="center"
      >
        <TextField
          size="small"
          placeholder="Search by name, email or zone..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setSearch(inputValue);
          }}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            ),
          }}
        />
        <CommonButton
          startIcon={<Plus size={18} />}
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
        >
          NEW USER
        </CommonButton>
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
