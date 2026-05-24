import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import debounce from "lodash.debounce";
import { API } from "@/common/lib/endpoints";
import {
  SalesOrder,
  Lookup,
  LookupRow,
  EditableField,
} from "@/app/admin/components/types/admin";
import { formatDateLocalYYYYMMDD } from "@/app/admin/components/utils/date";
import type { ViewType } from "@/app/admin/components/dashboard/Header";

type NotificationClearedPayload = {
  salesOrderNumber: string;
};

type NotificationNewPayload = {
  salesOrderNumber?: string;
  salesOrder?: {
    saleOrderNumber: string;
  };
};

const INLINE_EDIT_FIELDS: EditableField[] = [
  "status",
  "priority",
  "assignedUserId",
  "fgLocation",
];

export function useAdminDashboard() {
  const [userName, setUserName] = useState<string>("");
  // type ViewType = "" | "orders" | "master" | "manage" | "dispatch" | "fg_dashboard";

  const [view, setViewInternal] = useState<ViewType>("home");

  useEffect(() => {
    const stored = sessionStorage.getItem("adminView") as ViewType | null;
    if (stored) {
      setViewInternal(stored);
    }
  }, []);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const setView: Dispatch<SetStateAction<ViewType>> = (v) => {
    const newValue =
      typeof v === "function" ? (v as (prev: ViewType) => ViewType)(view) : v;

    sessionStorage.setItem("adminView", newValue);
    setViewInternal(newValue);
  };

  const [error, setError] = useState<string>("");

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [lookup, setLookup] = useState<Lookup>({
    products: [],
    transporters: [],
    plantCodes: [],
    salesZones: [],
    packConfigs: [],
    assignableUsers: [],
    customers: [],
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [editingCell, setEditingCell] = useState<{
    id: number;
    field: EditableField;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchProduct, setSearchProduct] = useState<string>("");

  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [zoneFilter, setZoneFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const [openCalendar, setOpenCalendar] = useState<boolean>(false);
  const [selectedMasterLookup, setSelectedMasterLookup] =
    useState<string>("products");
  const [masterLookupLoading, setMasterLookupLoading] = useState(false);
  const [masterLookupError, setMasterLookupError] = useState("");
  const [masterLookupData, setMasterLookupData] = useState<LookupRow[]>([]);
  const [masterEditingId, setMasterEditingId] = useState<number | null>(null);
  const [masterEditObj, setMasterEditObj] = useState<Partial<LookupRow>>({});
  const [masterAddObj, setMasterAddObj] = useState<Partial<LookupRow>>({});
  const [masterAdding, setMasterAdding] = useState(false);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  type ConfirmDeleteState = { type: string; id: number } | null;
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>(null);

  const [isStatesLoaded, setIsStatesLoaded] = useState(false);

  // Persistence - Load
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_orders_filters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.search !== undefined) setSearchInput(parsed.search);
        if (parsed.payment !== undefined) setPaymentFilter(parsed.payment);
        if (parsed.zone !== undefined) setZoneFilter(parsed.zone);
        if (parsed.status !== undefined) setStatusFilter(parsed.status);
        if (parsed.start) setStartDate(new Date(`${parsed.start}T00:00:00`));
        else if (parsed.start === null) setStartDate(null);
        if (parsed.end) setEndDate(new Date(`${parsed.end}T00:00:00`));
        else if (parsed.end === null) setEndDate(null);
        if (parsed.currentPage) setCurrentPage(parsed.currentPage);
        if (parsed.pageSize) setPageSize(parsed.pageSize);
      } catch (e) {
        console.error("Failed to load admin filters", e);
      }
    }
    setIsStatesLoaded(true);
  }, []);

  // Persistence - Save
  useEffect(() => {
    if (!isStatesLoaded) return;
    const filters = {
      search: searchInput,
      payment: paymentFilter,
      zone: zoneFilter,
      status: statusFilter,
      start: startDate ? formatDateLocalYYYYMMDD(startDate) : null,
      end: endDate ? formatDateLocalYYYYMMDD(endDate) : null,
      currentPage,
      pageSize,
    };
    sessionStorage.setItem("admin_orders_filters", JSON.stringify(filters));
  }, [
    searchInput,
    paymentFilter,
    zoneFilter,
    statusFilter,
    startDate,
    endDate,
    currentPage,
    pageSize,
    isStatesLoaded,
  ]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const obj = JSON.parse(stored);
        setUserName(obj.name || "");
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setToken(localStorage.getItem("token"));
  }, []);

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

  const debouncedSetSearchProduct = useMemo(
    () => debounce((value: string) => setSearchProduct(value), 400),
    [],
  );
  useEffect(
    () => () => debouncedSetSearchProduct.cancel(),
    [debouncedSetSearchProduct],
  );

  const fetchLookups = useCallback(async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      const [p, t, pc, sz, pk, au, c] = await Promise.all([
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
        axios.get(`${API.ADMIN.USERS}?role=USER`, {
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
        assignableUsers: Array.isArray(au.data)
          ? au.data.map((u: any) => ({
              ...u,
              name: u.email || u.name || "Unknown",
            }))
          : [],
        customers: c.data,
      });
    } catch {
      setError("Failed to load lookups.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    // const isSearching = !!(searchProduct || startDate || endDate);

    try {
      const res = await axios.get(API.ADMIN.SALES_ORDERS, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: pageSize,
          search: searchInput || undefined,
          paymentClearance: paymentFilter || undefined,
          salesZoneId: zoneFilter || undefined,
          statusFilter: statusFilter || undefined,
          startDate: formatDateLocalYYYYMMDD(startDate ?? undefined),
          endDate: formatDateLocalYYYYMMDD(endDate ?? undefined),
          sortBy,
          sortOrder,
        },
      });
      setOrders(res.data.data || []);
      setTotalOrders(res.data.total || 0);
    } catch (err: unknown) {
      let msg = "Failed to fetch orders.";

      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data?.message) {
          msg =
            typeof data.message === "string"
              ? data.message
              : JSON.stringify(data.message);
        }
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    searchProduct,
    searchInput,
    paymentFilter,
    zoneFilter,
    statusFilter,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (view === "orders") {
      fetchLookups();
      fetchOrders();
    }
  }, [view, fetchLookups, fetchOrders]);

  useEffect(() => {
    if (view === "orders") {
      fetchOrders();
    }
  }, [currentPage, searchInput, startDate, endDate, view, fetchOrders]);

  const saveCellEdit = async (row: SalesOrder) => {
    if (!editingCell) return;
    if (!INLINE_EDIT_FIELDS.includes(editingCell.field)) {
      cancelCellEdit();
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const field = editingCell.field;
      let value: string | number | boolean | null = editValue;

      if (field === "priority" || field === "assignedUserId") {
        value = editValue === "" ? null : Number(editValue);
      } else if (field === "status" || field === "fgLocation") {
        value = editValue;
      }

      await axios.patch(
        API.ADMIN.SALES_ORDER_BY_ID(row.id),
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setEditingCell(null);
      setEditValue("");
      setSnackbar({ open: true, message: "Updated!", severity: "success" });
      fetchOrders();
    } catch {
      setSnackbar({ open: true, message: "Update failed.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const startCellEdit = (row: SalesOrder, field: EditableField) => {
    if (!INLINE_EDIT_FIELDS.includes(field)) return;
    setEditingCell({ id: row.id, field });
    const value = row[field as keyof SalesOrder];
    setEditValue(value !== undefined && value !== null ? String(value) : "");
  };

  const cancelCellEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: SalesOrder,
  ) => {
    if (e.key === "Enter") saveCellEdit(row);
    else if (e.key === "Escape") cancelCellEdit();
  };

  const onOrderDelete = async (id: number) => {
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(API.ADMIN.SALES_ORDER_BY_ID(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders();
    } catch (error: unknown) {
      let message = "Delete failed.";
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;
        message = typeof msg === "string" ? msg : JSON.stringify(msg);
      } else if (error instanceof Error) {
        message = error.message;
      }
      setDeleteError(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const updateOrderModal = async (
    orderId: number,
    patch: Partial<SalesOrder>,
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const {
        saleOrderNumber,
        outboundDelivery,
        transferOrder,
        transporterId,
        productId,
        // plantCodeId,
        plantCode,
        salesZoneId,
        packConfigId,
        priority,
        assignedUserId,
        specialRemarks,
        fgLocation,
      } = patch;

      const payload: Record<string, unknown> = {};
      if (saleOrderNumber !== undefined)
        payload.saleOrderNumber = saleOrderNumber;
      if (outboundDelivery !== undefined)
        payload.outboundDelivery = outboundDelivery;
      if (transferOrder !== undefined) payload.transferOrder = transferOrder;
      if (productId !== undefined && productId !== null)
        payload.productId = Number(productId);
      // if (plantCodeId !== undefined && plantCodeId !== null)
      //   payload.plantCodeId = Number(plantCodeId);
      if (plantCode !== undefined) payload.plantCode = plantCode;
      if (transporterId !== undefined && transporterId !== null)
        payload.transporterId = Number(transporterId);
      if (salesZoneId !== undefined && salesZoneId !== null)
        payload.salesZoneId = Number(salesZoneId);
      if (packConfigId !== undefined && packConfigId !== null)
        payload.packConfigId = Number(packConfigId);
      if (assignedUserId !== undefined && assignedUserId !== null)
        payload.assignedUserId = Number(assignedUserId);
      if (priority !== undefined && priority !== null)
        payload.priority = Number(priority);

      if (specialRemarks !== undefined) payload.specialRemarks = specialRemarks;
      if (fgLocation !== undefined) payload.fgLocation = fgLocation;

      await axios.patch(API.ADMIN.SALES_ORDER_BY_ID(orderId), payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: "Order Updated!",
        severity: "success",
      });
      fetchOrders();
    } catch {
      setSnackbar({ open: true, message: "Update failed.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setPaymentFilter("");
    setZoneFilter("");
    setStatusFilter("");
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };

  const handleTodayFilters = () => {
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setCurrentPage(1);
  };

  const refreshMaster = () => fetchMasterLookup(selectedMasterLookup);

  const fetchMasterLookup = async (type: string) => {
    setMasterLookupLoading(true);
    setMasterLookupError("");
    setMasterLookupData([]);
    setMasterEditingId(null);
    setMasterEditObj({});
    setMasterAddObj({});
    try {
      const token = localStorage.getItem("token");
      let url = "";
      switch (type) {
        case "products":
          url = API.LOOKUP.PRODUCTS;
          break;
        case "transporters":
          url = API.LOOKUP.TRANSPORTERS;
          break;
        case "plantCodes":
          url = API.LOOKUP.PLANT_CODES;
          break;
        case "salesZones":
          url = API.LOOKUP.SALES_ZONES;
          break;
        case "packConfigs":
          url = API.LOOKUP.PACK_CONFIGS;
          break;
        case "customers":
          url = API.LOOKUP.CUSTOMERS;
          break;
        case "printers":
          url = API.LOOKUP.PRINTERS;
          break;
        default:
          throw new Error("Invalid lookup type");
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMasterLookupData(res.data || []);
    } catch {
      setMasterLookupError("Failed to load lookup.");
    }
    setMasterLookupLoading(false);
  };

  useEffect(() => {
    if (view === "master" && selectedMasterLookup) {
      fetchMasterLookup(selectedMasterLookup);
    }
  }, [view, selectedMasterLookup]);

  const onMasterEdit = (id: number, row: LookupRow) => {
    setMasterEditingId(id);
    setMasterEditObj(row);
  };

  const onMasterEditChange = (
    key: string,
    value: string | number | boolean | null | undefined,
  ) => {
    setMasterEditObj((obj) => ({ ...obj, [key]: value }));
  };

  const onMasterEditSave = async (type: string, id: number) => {
    setMasterLookupLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = "";
      switch (type) {
        case "products":
          url = API.LOOKUP.PRODUCT_BY_ID(id);
          break;
        case "transporters":
          url = API.LOOKUP.TRANSPORTER_BY_ID(id);
          break;
        case "plantCodes":
          url = API.LOOKUP.PLANT_CODE_BY_ID(id);
          break;
        case "salesZones":
          url = API.LOOKUP.SALES_ZONE_BY_ID(id);
          break;
        case "packConfigs":
          url = API.LOOKUP.PACK_CONFIG_BY_ID(id);
          break;
        case "customers":
          url = API.LOOKUP.CUSTOMER_BY_ID(id);
          break;
        case "printers":
          url = API.LOOKUP.PRINTER_BY_ID(id);
          break;
        default:
          throw new Error("Invalid lookup type");
      }
      await axios.patch(url, masterEditObj, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMasterEditingId(null);
      setMasterEditObj({});
      fetchMasterLookup(type);
      setSnackbar({
        open: true,
        message: "Updated successfully.",
        severity: "success",
      });
    } catch {
      setSnackbar({ open: true, message: "Update failed.", severity: "error" });
    }
    setMasterLookupLoading(false);
  };

  const onMasterRequestDelete = async (type: string, id: number) => {
    setMasterLookupLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = "";
      switch (type) {
        case "products":
          url = API.LOOKUP.PRODUCT_BY_ID(id);
          break;
        case "transporters":
          url = API.LOOKUP.TRANSPORTER_BY_ID(id);
          break;
        case "plantCodes":
          url = API.LOOKUP.PLANT_CODE_BY_ID(id);
          break;
        case "salesZones":
          url = API.LOOKUP.SALES_ZONE_BY_ID(id);
          break;
        case "packConfigs":
          url = API.LOOKUP.PACK_CONFIG_BY_ID(id);
          break;
        case "customers":
          url = API.LOOKUP.CUSTOMER_BY_ID(id);
          break;
        case "printers":
          url = API.LOOKUP.PRINTER_BY_ID(id);
          break;
        default:
          throw new Error("Invalid lookup type");
      }
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMasterLookup(type);
      setSnackbar({
        open: true,
        message: "Deleted successfully!",
        severity: "success",
      });
    } catch (error: unknown) {
      let message = "Delete failed.";
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;
        message = typeof msg === "string" ? msg : JSON.stringify(msg);
      } else if (error instanceof Error) {
        message = error.message;
      }
      setSnackbar({ open: true, message, severity: "error" });
    }
    setMasterLookupLoading(false);
  };

  const onMasterCancel = () => setMasterEditingId(null);

  const onMasterAddChange = (
    key: string,
    value: string | number | boolean | null | undefined,
  ) => {
    setMasterAddObj((obj) => ({ ...obj, [key]: value }));
  };

  const onMasterAdd = async (type: string) => {
    setMasterAdding(true);
    try {
      const token = localStorage.getItem("token");
      let url = "";
      switch (type) {
        case "products":
          url = API.LOOKUP.PRODUCTS;
          break;
        case "transporters":
          url = API.LOOKUP.TRANSPORTERS;
          break;
        case "plantCodes":
          url = API.LOOKUP.PLANT_CODES;
          break;
        case "salesZones":
          url = API.LOOKUP.SALES_ZONES;
          break;
        case "packConfigs":
          url = API.LOOKUP.PACK_CONFIGS;
          break;
        case "customers":
          url = API.LOOKUP.CUSTOMERS;
          break;
        case "printers":
          url = API.LOOKUP.PRINTERS;
          break;
        default:
          throw new Error("Invalid lookup type");
      }
      await axios.post(url, masterAddObj, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMasterAddObj({});
      fetchMasterLookup(type);
    } catch (error: unknown) {
      let message = "Create failed.";
      if (axios.isAxiosError(error)) {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;
        message = typeof msg === "string" ? msg : JSON.stringify(msg);
      } else if (error instanceof Error) {
        message = error.message;
      }
      setSnackbar({ open: true, message, severity: "error" });
    }
    setMasterAdding(false);
  };

  return {
    userName,
    view,
    setView,
    error,
    setError,

    orders,
    setOrders,
    lookup,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalOrders,
    editingCell,
    editValue,
    startCellEdit,
    setEditValue,
    saveCellEdit,
    cancelCellEdit,
    handleInputKeyDown,
    loading,
    updateOrderModal,
    fetchOrders,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,

    searchInput,
    setSearchInput,
    searchProduct,
    setSearchProduct,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    openCalendar,
    setOpenCalendar,
    handleClearFilters,

    onOrderDelete,
    deleteError,
    deleteLoading,

    selectedMasterLookup,
    setSelectedMasterLookup,
    masterLookupLoading,
    masterLookupError,
    masterLookupData,
    masterEditingId,
    masterEditObj,
    onMasterEdit,
    onMasterEditChange,
    onMasterEditSave,
    onMasterRequestDelete,
    onMasterCancel,
    masterAddObj,
    onMasterAddChange,
    onMasterAdd,
    masterAdding,
    refreshMaster,

    confirmDelete,
    setConfirmDelete,

    paymentFilter,
    setPaymentFilter,
    zoneFilter,
    setZoneFilter,
    statusFilter,
    setStatusFilter,

    handleTodayFilters,

    snackbar,
    onSnackbarClose: () => setSnackbar((prev) => ({ ...prev, open: false })),
  };
}
