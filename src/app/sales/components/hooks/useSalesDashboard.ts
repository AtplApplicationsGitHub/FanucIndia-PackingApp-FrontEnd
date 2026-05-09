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

export type SalesDashboardView = "home" | "orders" | "dispatched";

export function useSalesDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [salesZone, setSalesZone] = useState("");
  const [alert, setAlert] = useState<{
    severity: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  const [view, setViewInternal] = useState<SalesDashboardView>("home");

  // Filter states
  const [paymentFilter, setPaymentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const handleClearFilters = () => {
    setSearchTerm("");
    setPaymentFilter("");
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
        const parsed = JSON.parse(storedUser);  
        setUserName(parsed.name || "");
        setSalesZone(parsed.salesZone || "");
      } catch { }
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

  const fetchLookups = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    let parsedUser: any = null;
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) parsedUser = JSON.parse(storedUser);
    } catch (e) { }

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

      let filteredSalesZones = sz.data;
      if (parsedUser && parsedUser.role === 'SALES' && parsedUser.salesZoneId) {
        filteredSalesZones = sz.data.filter((zone: any) => zone.id === parsedUser.salesZoneId);
      }

      setLookup({
        products: p.data,
        transporters: t.data,
        plantCodes: pc.data,
        salesZones: filteredSalesZones,
        packConfigs: pk.data,
        customers: c.data,
      });
    } catch (err) {
      setError("Failed to load lookups.");
    } finally {
      setLookupsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

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

  const toLocalYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`; // YYYY-MM-DD in local time
  };

  const fetchOrders = useCallback(
    (page = currentPage, size = pageSize) => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");
      setLoading(true);

      let finalStatusFilter = statusFilter || undefined;
      let finalExcludeStatus = undefined;

      if (view === "dispatched") {
        finalStatusFilter = "Dispatched";
      } else if (view === "orders" && !statusFilter) {
        finalExcludeStatus = "Dispatched";
      }

      axios
        .get(API.SALES.CREATE_ORDER, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: searchTerm || undefined,
            paymentClearance: paymentFilter || undefined,
            status: finalStatusFilter,
            excludeStatus: finalExcludeStatus,
            startDate: startDate ? toLocalYMD(startDate) : undefined,
            endDate: endDate ? toLocalYMD(endDate) : undefined,
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
      statusFilter,
      startDate,
      endDate,
      currentPage,
      pageSize,
      view,
    ],
  );

  useEffect(() => {
    if (view === "orders" || view === "dispatched") {
      fetchOrders(currentPage, pageSize);
    }
  }, [currentPage, pageSize, fetchOrders, view]);

  useEffect(() => {
    if (view === "orders" || view === "dispatched") {
      setCurrentPage(1);
      fetchOrders(1, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, paymentFilter, statusFilter, startDate, endDate, view]);

  const handleDownloadTemplate = useCallback(async (isBlank: boolean = false) => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    try {
      setAlert({ severity: "info", message: isBlank ? "Downloading Blank Template..." : "Downloading Template..." });

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (paymentFilter) params.append("paymentClearance", paymentFilter);
      if (startDate) params.append("startDate", toLocalYMD(startDate));
      if (endDate) params.append("endDate", toLocalYMD(endDate));

      if (isBlank) params.append("blank", "true");

      if (view === "dispatched") {
        params.append("status", "Dispatched");
      } else if (statusFilter) {
        params.append("status", statusFilter);
      } else if (view === "orders") {
        params.append("excludeStatus", "Dispatched");
      }

      const url = `${API.SALES.EXCEL_EXPORT}?${params.toString()}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Export failed");

      const cd = res.headers.get("content-disposition") || "";
      const mStar = cd.match(/filename\*=UTF-8''([^;]+)/i);
      const fallbackFilename = isBlank ? "Blank_Sales_Orders_Template.xlsx" : "Sales_Orders_Template.xlsx";

      const filename =
        (mStar?.[1] ? decodeURIComponent(mStar[1]) : null) ||
        cd.match(/filename="([^"]+)"/i)?.[1] ||
        cd.match(/filename=([^;]+)/i)?.[1]?.trim() ||
        fallbackFilename;

      const blob = await res.blob();
      secureDownload(blob, filename);
      setAlert({
        severity: "success",
        message: "Template downloaded successfully!",
      });
    } catch (error) {
      setAlert({ severity: "error", message: "Failed to download template." });
    }
  }, [searchTerm, paymentFilter, statusFilter, startDate, endDate, view]);

  const handleBulkUpload = () => fileInputRef.current?.click();

  const handleUploadAttachment = () => attachmentFileInputRef.current?.click();

  const handleAttachmentFileChange = useCallback(async (files: File[]) => {
    if (files.length === 0 || selectedIds.length === 0) {
      setAlert({ severity: "warning", message: "Please select orders and files." });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("salesOrderIds", selectedIds.join(","));
      files.forEach((file) => formData.append("files", file));

      await axios.post(API.SALES.ATTACHMENTS, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlert({ severity: "success", message: "Attachments uploaded successfully!" });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Upload failed."
        : "Upload failed.";
      setAlert({ severity: "error", message });
    }
  }, [selectedIds]);

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
        // The backend wraps the actual errors inside a 'message' object sometimes
        const responseData = err.response.data;
        const errorData = (responseData.message && responseData.message.errors) 
                          ? responseData.message 
                          : responseData;

        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          // If there are many errors, show the first 3 to prevent a massive popup, then indicate there are more
          const maxErrorsToShow = 3;
          const detailedErrors = errorData.errors
            .slice(0, maxErrorsToShow)
            .map((e: any) => `Row ${e.row}: ${e.errors.join(", ")}`)
            .join(" | "); // Use a pipe or separator since Snackbar doesn't handle \n well
          
          const extraErrors = errorData.errors.length > maxErrorsToShow 
                              ? ` (+${errorData.errors.length - maxErrorsToShow} more errors)` 
                              : "";
                              
          message = `Import failed: ${detailedErrors}${extraErrors}`;
        } else if (typeof responseData.message === 'string') {
          message = responseData.message;
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

  const handleDownloadBlankTemplate = useCallback(() => {
    return handleDownloadTemplate(true);
  }, [handleDownloadTemplate]);

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
    salesZone,
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteModalClose,
    handleLogout,
    handleDownloadTemplate: () => handleDownloadTemplate(false),
    handleDownloadBlankTemplate,
    handleBulkUpload,
    attachmentFileInputRef,
    handleUploadAttachment,
    handleAttachmentFileChange,
    selectedIds,
    setSelectedIds,
    fileInputRef,
    handleFileChange,
    handleModalClose,
    fetchOrders,
    alert,
    setAlert,
    paymentFilter,
    setPaymentFilter,
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleClearFilters,
    updateFileInputRef,
  };
}
