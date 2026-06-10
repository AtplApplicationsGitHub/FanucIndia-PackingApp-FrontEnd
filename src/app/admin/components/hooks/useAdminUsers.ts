import { useState, useCallback } from "react";
import axios from "axios";
import { API } from "@/common/lib/endpoints";
import { User } from "@/app/admin/components/types/admin";

type APIErrorResponse = {
  message?: string | object;
  error?: string | object;
  [key: string]: unknown;
};
function getErrorMessage(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as APIErrorResponse | undefined;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
    if (data && typeof data === "object") {
      const msg = data.message !== undefined ? data.message : data.error;
      if (typeof msg === "string") return msg;
      if (msg !== undefined) return JSON.stringify(msg);
      return fallback;
    }
    if (typeof e.message === "string") return e.message;
    if (typeof e.message !== "undefined") return JSON.stringify(e.message);
  } else if (e instanceof Error) {
    return e.message;
  }
  return fallback;
}

export function useAdminUsers(
  showSnackbar: (
    msg: string,
    severity: "success" | "error" | "info" | "warning",
  ) => void,
) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchUsers = useCallback(
    async (search?: string) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<User[]>(API.ADMIN.USERS, {
          headers: { Authorization: `Bearer ${token}` },
          params: { search },
        });
        setUsers(res.data || []);
      } catch (e) {
        const message = getErrorMessage(e, "Failed to fetch users.");
        setError(message);
        showSnackbar(String(message), "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar],
  );

  const createUser = async (
    data: Omit<User, "id" | "createdAt" | "updatedAt"> & { password: string },
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(API.ADMIN.USERS, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSnackbar("User created!", "success");
      fetchUsers();
      setModalOpen(false);
    } catch (e) {
      const message = getErrorMessage(e, "Failed to create user.");
      showSnackbar(String(message), "error");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (
    id: number,
    data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">> & {
      password?: string;
    },
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(API.ADMIN.USER_BY_ID(id), data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSnackbar("User updated!", "success");
      fetchUsers();
      setModalOpen(false);
      setEditingUser(null);
    } catch (e) {
      const message = getErrorMessage(e, "Failed to update user.");
      showSnackbar(String(message), "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(API.ADMIN.USER_BY_ID(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSnackbar("User deleted!", "success");
      fetchUsers();
    } catch (e) {
      const message = getErrorMessage(e, "Failed to delete user.");
      if (
        typeof message === "string" &&
        message.toLowerCase().includes("existing sales orders")
      ) {
        showSnackbar(
          "Cannot delete this user because they have existing sales orders.",
          "error",
        );
      } else {
        showSnackbar(message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    editingUser,
    setEditingUser,
    modalOpen,
    setModalOpen,
  };
}
