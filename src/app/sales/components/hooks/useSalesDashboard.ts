import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { API } from "@/common/lib/endpoints";
import { SalesOrder, LookupData } from "@/app/sales/components/types/sales";
import { secureDownload } from "@/common/lib/secure-download";

type NotificationClearedPayload = {
  salesOrderNumber: string;
};

type NotificationNewPayload = {
  salesOrderNumber?: string;
  salesOrder?: {
    saleOrderNumber: string;
  };
};

export type SalesDashboardView = "home" | "orders";

export function useSalesDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const [pageSize, setPageSize] = useState(10);

  const [totalOrders, setTotalOrders] = useState(0);
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
  const [searchTerm, setSearchTerm] = useState("");

  const [alert, setAlert] = useState<{
    severity: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  const [view, setViewInternal] = useState<SalesDashboardView>("home");

  // Filter states
  const [paymentFilter, setPaymentFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleClearFilters = () => {
    setSearchTerm("");
    setPaymentFilter("");
    setZoneFilter("");
    setStatusFilter("");
    setStartDate(null);
    setEndDate(null);
  };

  // On initial load, check session storage for a saved view
  useEffect(() => {
    const savedView = sessionStorage.getItem(
      "salesDashboardView",
    ) as SalesDashboardView;
    if (savedView) {
      setViewInternal(savedView);
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserName(JSON.parse(storedUser).name || "");
      } catch {}
    }
  }, []);

  // Wrapper for setView to also save to session storage
  const setView = (newView: SalesDashboardView) => {
    sessionStorage.setItem("salesDashboardView", newView);
    setViewInternal(newView);
  };

  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => setAlert(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [alert]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSize = localStorage.getItem("pageSize");
      if (storedSize && !isNaN(Number(storedSize))) {
        setPageSize(Number(storedSize));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentToken = localStorage.getItem("token");
      if (!currentToken) router.replace("/login");
      setToken(currentToken);
    }
  }, [router]);

  // --- FETCH LOOKUPS LOGIC ---
  const fetchLookups = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setLookupsLoading(true);
    setError("");
    try {
      const [p, t, pc, sz, pk, c] = await Promise.all([
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
      ]);
      setLookup({
        products: p.data,
        transporters: t.data,
        plantCodes: pc.data,
        salesZones: sz.data,
        packConfigs: pk.data,
        customers: c.data,
      });
    } catch (err) {
      setError("Failed to load lookups.");
    } finally {
      setLookupsLoading(false);
    }
  }, []);

  // Initial Fetch of Lookups
  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  // Socket Connection
  useEffect(() => {
    if (!token) return;

    const s = io(API.SO_SOCKET_BASE, {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = s;

    s.on("notification:new", (payload: NotificationNewPayload) => {
      const so =
        payload.salesOrder?.saleOrderNumber ?? payload.salesOrderNumber ?? "";
      if (!so) return;

      setOrders((prev) =>
        prev.map((o) =>
          o.saleOrderNumber === so
            ? { ...o, notificationCount: (o.notificationCount ?? 0) + 1 }
            : o,
        ),
      );
    });

    s.on("notification:cleared", (payload: NotificationClearedPayload) => {
      const so = payload.salesOrderNumber;
      if (!so) return;

      setOrders((prev) =>
        prev.map((o) =>
          o.saleOrderNumber === so ? { ...o, notificationCount: 0 } : o,
        ),
      );
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // --- FETCH ORDERS LOGIC ---
  const fetchOrders = useCallback(
    (page = currentPage, size = pageSize) => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");
      setLoading(true);
      axios
        .get(API.SALES.CREATE_ORDER, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: searchTerm || undefined,
            paymentClearance: paymentFilter || undefined,
            salesZoneId: zoneFilter || undefined,
            status: statusFilter || undefined,
            startDate: startDate ? startDate.toISOString() : undefined,
            endDate: endDate ? endDate.toISOString() : undefined,
            page,
            limit: size,
          },
        })
        .then((res) => {
          setOrders(res.data.orders || []);
          setTotalOrders(res.data.totalCount || 0);
        })
        .catch(() => {
          setAlert({ severity: "error", message: "Failed to fetch orders." });
          setError("Failed to fetch orders.");
        })
        .finally(() => setLoading(false));
    },
    [
      searchTerm,
      paymentFilter,
      zoneFilter,
      statusFilter,
      startDate,
      endDate,
      currentPage,
      pageSize,
    ],
  );

  useEffect(() => {
    if (view === "orders") {
      fetchOrders(currentPage, pageSize);
    }
  }, [currentPage, pageSize, fetchOrders, view]);

  useEffect(() => {
    if (view === "orders") {
      setCurrentPage(1);
      fetchOrders(1, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchTerm,
    paymentFilter,
    zoneFilter,
    statusFilter,
    startDate,
    endDate,
    view,
  ]);

  const handleExcelExport = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    try {
      setAlert({ severity: "info", message: "Exporting Excel..." });
      
      // Build query parameters based on current filters
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (paymentFilter) params.append("paymentClearance", paymentFilter);
      if (zoneFilter) params.append("salesZoneId", zoneFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());

      const url = `${API.SALES.EXCEL_EXPORT}?${params.toString()}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Export failed");

      const cd = res.headers.get("content-disposition") || "";
      const filename =
        cd.match(/filename="([^"]+)"/i)?.[1] || "sales_orders_export.xlsx";

      const blob = await res.blob();
      secureDownload(blob, filename);
      setAlert({
        severity: "success",
        message: "Export downloaded successfully!",
      });
    } catch (error) {
      setAlert({ severity: "error", message: "Failed to export Excel data." });
    }
  }, [searchTerm, paymentFilter, zoneFilter, statusFilter, startDate, endDate]);

  const handleExcelImportChange = useCallback(async () => {
    const input = updateFileInputRef.current;
    if (!input?.files?.[0]) return;
    const file = input.files[0];

    try {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(API.SALES.EXCEL_IMPORT, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlert({
        severity: "success",
        message: response.data.message || "Excel imported successfully!",
      });
      await fetchOrders();
      await fetchLookups();
    } catch (err: any) {
      const message = err.response?.data?.message || "Excel import failed.";
      setAlert({ severity: "error", message });
    } finally {
      setLoading(false);
      if (input) input.value = "";
    }
  }, [fetchOrders, fetchLookups]);

  const handleDownloadTemplate = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API.SALES.TEMPLATE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();

      const cd = res.headers.get("content-disposition") || "";

      const mStar = cd.match(/filename\*=UTF-8''([^;]+)/i);
      const filename =
        (mStar?.[1] ? decodeURIComponent(mStar[1]) : null) ||
        cd.match(/filename="([^"]+)"/i)?.[1] ||
        cd.match(/filename=([^;]+)/i)?.[1]?.trim() ||
        "bulk_import_excel.xlsx";

      const blob = await res.blob();
      secureDownload(blob, filename);
    } catch {
      setAlert({ severity: "error", message: "Failed to download template" });
    }
  }, []);

  const handleBulkUpload = () => fileInputRef.current?.click();

  const handleFileChange = useCallback(async () => {
    const input = fileInputRef.current;
    if (!input?.files?.[0]) return;
    const file = input.files[0];

    try {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(API.SALES.IMPORT, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        validateStatus: (status) => status >= 200 && status < 300,
      });

      setAlert({ severity: "success", message: "Bulk import successful!" });
      await fetchOrders();
      await fetchLookups();
    } catch (err: unknown) {
      let message = "Bulk import failed. Check your file and try again.";

      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data as {
          message?: string;
          errors?: { row: number; errors: string[] }[];
        };

        if (errorData.errors && errorData.errors.length > 0) {
          const detailedErrors = errorData.errors
            .map((e) => `Row ${e.row}: ${e.errors.join(", ")}`)
            .join("\n");
          message = `Import failed. Please correct the following errors:\n${detailedErrors}`;
        } else if (errorData.message) {
          message = errorData.message;
        }
      }

      setAlert({
        severity: "error",
        message: message,
      });
    } finally {
      if (input) input.value = "";
    }
  }, [fetchOrders, fetchLookups]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");
      await axios.delete(`${API.SALES.CREATE_ORDER}/${deletingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletingId(null);
      fetchOrders();
      setAlert({ severity: "success", message: "Order deleted successfully." });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setDeleteError(
          err.response?.data?.message || "Delete failed. Try again.",
        );
        setAlert({
          severity: "error",
          message: err.response?.data?.message || "Delete failed. Try again.",
        });
      } else if (err instanceof Error) {
        setDeleteError(err.message);
        setAlert({ severity: "error", message: err.message });
      } else {
        setDeleteError("Delete failed. Try again.");
        setAlert({
          severity: "error",
          message: "Delete failed. Try again.",
        });
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.replace("/login");
  };

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

  const handleSetPageSize = (size: number) => {
    setPageSize(size);
    if (typeof window !== "undefined") {
      localStorage.setItem("pageSize", size.toString());
    }
  };

  return {
    orders,
    pageSize,
    setPageSize: handleSetPageSize,
    totalOrders,
    lookup,
    loading,
    lookupsLoading,
    error,
    userName,
    view,
    setView,
    searchTerm,
    setSearchTerm,
    currentPage,
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
    alert,
    setAlert,
    paymentFilter,
    setPaymentFilter,
    zoneFilter,
    setZoneFilter,
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleClearFilters,
    updateFileInputRef,
    handleExcelExport,
    handleExcelImportChange,
  };
}
