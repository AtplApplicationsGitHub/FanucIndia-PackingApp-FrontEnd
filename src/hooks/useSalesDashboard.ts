import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { API } from "@/lib/api";
import { SalesOrder, LookupData } from "@/types/sales";
import * as XLSX from "xlsx";

const PAGE_SIZE = 10;

export function useSalesDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [lookup, setLookup] = useState<LookupData>({
    products: [],
    transporters: [],
    plantCodes: [],
    salesZones: [],
    packConfigs: [],
    customers: [],
  });
  const [loading, setLoading] = useState(true);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
  }, [router]);

  // Load user name
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUserName(JSON.parse(stored).name || "");
      } catch {}
    }
  }, []);

  // Fetch lookups
  useEffect(() => {
    const token = localStorage.getItem("token");
    setLookupsLoading(true);
    setError("");
    Promise.all([
      axios.get(API.LOOKUP.PRODUCTS, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(API.LOOKUP.TRANSPORTERS, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(API.LOOKUP.PLANT_CODES, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(API.LOOKUP.SALES_ZONES, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(API.LOOKUP.PACK_CONFIGS, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(API.LOOKUP.CUSTOMERS, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([p, t, pc, sz, pk, c]) =>
        setLookup({
          products: p.data,
          transporters: t.data,
          plantCodes: pc.data,
          salesZones: sz.data,
          packConfigs: pk.data,
          customers: c.data,
        })
      )
      .catch(() => setError("Failed to load lookups."))
      .finally(() => setLookupsLoading(false));
  }, []);

  // Fetch orders with search
  const fetchOrders = useCallback(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get(API.SALES.CREATE_ORDER, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm || undefined },
      })
      .then((res) => {
        setOrders(res.data || []);
        setCurrentPage(1);
      })
      .catch(() => setError("Failed to fetch orders."))
      .finally(() => setLoading(false));
  }, [searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // File
  const handleDownloadTemplate = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API.SALES.TEMPLATE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const disp = res.headers.get("content-disposition") || "";
      const fn = disp.match(/filename="?(.+)"?/)?.[1] || "template.xlsx";
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fn;
      document.body.append(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download template");
    }
  }, []);

  const handleBulkUpload = () => fileInputRef.current?.click();

  const handleFileChange = useCallback(async () => {
    const input = fileInputRef.current;
    if (!input?.files?.[0]) return;
    const file = input.files[0];

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(API.SALES.IMPORT, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        validateStatus: (status) => status >= 200 && status < 300, // let Axios treat all 2xx as success
      });

      toast.success("Bulk import successful!");
      await fetchOrders();
    } catch (err) {
      toast.error("Bulk import failed. Check your file and try again.");
      console.error(err);
    } finally {
      if (input) input.value = "";
    }
  }, [fetchOrders]);

  // Delete
  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API.SALES.CREATE_ORDER}/${deletingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletingId(null);
      fetchOrders();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setDeleteError(
          err.response?.data?.message || "Delete failed. Try again."
        );
      } else if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError("Delete failed. Try again.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const pagedOrders = orders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [orders, currentPage, totalPages]);

  // Modals
  const handleEdit = (order: SalesOrder) => {
    setEditingOrder(order);
    setShowForm(true);
  };
  const handleCreate = () => {
    setEditingOrder(null);
    setShowForm(true);
  };
  const handleModalClose = () => {
    setShowForm(false);
    setEditingOrder(null);
  };
  const handleDeleteModalClose = () => setDeletingId(null);

  return {
    orders,
    pagedOrders,
    lookup,
    loading,
    lookupsLoading,
    error,
    userName,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    setCurrentPage,
    showForm,
    setShowForm,
    editingOrder,
    deletingId,
    setDeletingId,
    deleteLoading,
    deleteError,
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteModalClose,
    handleLogout,
    handleDownloadTemplate,
    handleBulkUpload,
    fileInputRef,
    handleFileChange,
    handleModalClose,
    fetchOrders,
  };
}
