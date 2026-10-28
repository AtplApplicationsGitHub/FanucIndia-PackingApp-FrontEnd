import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { API } from "@/common/lib/endpoints";
import { User } from "@/app/admin/components/types/admin";
import { secureDownload } from "@/common/lib/secure-download";

/** Role filter of the Users master table ("USER" = Terminal Operators only). */
export type UserRoleFilter = "USER";

export const TERMINAL_OPERATOR_FILE_NAME = "Terminal Operator User List.xlsx";

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

  // Last search / role filter of the table, so a refresh after create / update / delete keeps them
  const lastQueryRef = useRef<{ search?: string; role?: UserRoleFilter }>({});

  const fetchUsers = useCallback(
    async (search?: string, role?: UserRoleFilter) => {
      lastQueryRef.current = { search, role };
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<User[]>(API.ADMIN.USERS, {
          headers: { Authorization: `Bearer ${token}` },
          params: { search, role },
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

  /** Reload the table with the same search / role filter it is showing. */
  const refreshUsers = useCallback(
    () => fetchUsers(lastQueryRef.current.search, lastQueryRef.current.role),
    [fetchUsers],
  );

  /**
   * Downloads "Terminal Operator User List.xlsx": role USER accounts (ID, Name, Email),
   * filtered by the search applied in the table - the same rows the table shows.
   */
  const [exporting, setExporting] = useState(false);
  const downloadTerminalOperators = useCallback(
    async (search?: string) => {
      setExporting(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<Blob>(
          API.ADMIN.USERS_EXPORT_TERMINAL_OPERATORS,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { search: search || undefined },
            responseType: "blob",
          },
        );
        secureDownload(res.data, TERMINAL_OPERATOR_FILE_NAME);
      } catch (e) {
        // Error body arrives as a Blob (responseType "blob") - read the server message from it
        let message = "Failed to download the Terminal Operator list.";
        if (axios.isAxiosError(e) && e.response?.data instanceof Blob) {
          try {
            const body = JSON.parse(await e.response.data.text());
            if (typeof body?.message === "string") message = body.message;
          } catch {
            // keep the default message
          }
        }
        showSnackbar(message, "error");
      } finally {
        setExporting(false);
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
      refreshUsers();
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
      refreshUsers();
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
      refreshUsers();
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
    downloadTerminalOperators,
    exporting,
    createUser,
    updateUser,
    deleteUser,
    editingUser,
    setEditingUser,
    modalOpen,
    setModalOpen,
  };
}
