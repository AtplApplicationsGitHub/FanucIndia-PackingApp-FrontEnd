import { useState, useCallback } from "react";
import axios from "axios";
import { API } from "@/lib/api";
import { toast } from "sonner";
import { User, UserRole } from "@/types/admin";

function getErrorMessage(e: any, fallback: string) {
  const data = e?.response?.data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;
  if (data && typeof data === "object") {
    // If error object, stringify for dev, but you can show a generic message for users
    return data.message || data.error || fallback;
  }
  if (typeof e?.message === "string") return e.message;
  return fallback;
}

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API.ADMIN.USERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data || []);
    } catch (e: any) {
      const message = getErrorMessage(e, "Failed to fetch users.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (data: Omit<User, "id" | "createdAt" | "updatedAt"> & { password: string }) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(API.ADMIN.USERS, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User created!");
      fetchUsers();
      setModalOpen(false);
    } catch (e: any) {
      const message = getErrorMessage(e, "Failed to create user.");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: number, data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">> & { password?: string }) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(API.ADMIN.USER_BY_ID(id), data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User updated!");
      fetchUsers();
      setModalOpen(false);
      setEditingUser(null);
    } catch (e: any) {
      const message = getErrorMessage(e, "Failed to update user.");
      toast.error(message);
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
      toast.success("User deleted!");
      fetchUsers();
    } catch (e: any) {
      const message = getErrorMessage(e, "Failed to delete user.");
      toast.error(message);
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
