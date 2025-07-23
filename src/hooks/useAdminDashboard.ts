import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { API } from "@/lib/api";
import { toast } from "sonner";
import { SalesOrder, Lookup, LookupRow, EditableField } from "@/types/admin";
import { formatDateLocalYYYYMMDD } from "@/utils/date";

// Only allow these for inline editing
const INLINE_EDIT_FIELDS: EditableField[] = [
  "status",
  "priority",
  "terminalId",
];

export function useAdminDashboard() {
  // ----------------- GENERAL STATE -----------------
  const [userName, setUserName] = useState<string>("");
  const [view, setView] = useState<"" | "orders" | "master" | "manage">("");
  const [error, setError] = useState<string>("");

  // ----------------- ORDERS STATE ------------------
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [lookup, setLookup] = useState<Lookup>({
    products: [],
    transporters: [],
    plantCodes: [],
    salesZones: [],
    packConfigs: [],
    terminals: [],
    customers: [],
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [editingCell, setEditingCell] = useState<{
    id: number;
    field: EditableField;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // ----------- SEARCH & FILTER STATE -----------
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchProduct, setSearchProduct] = useState<string>("");
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
  const [openCalendar, setOpenCalendar] = useState<boolean>(false);

  // -------------- MASTER LOOKUP STATE --------------
  const [selectedMasterLookup, setSelectedMasterLookup] =
    useState<string>("products");
  const [masterLookupLoading, setMasterLookupLoading] = useState(false);
  const [masterLookupError, setMasterLookupError] = useState("");
  const [masterLookupData, setMasterLookupData] = useState<LookupRow[]>([]);
  const [masterEditingId, setMasterEditingId] = useState<number | null>(null);
  const [masterEditObj, setMasterEditObj] = useState<Partial<LookupRow>>({});
  const [masterAddObj, setMasterAddObj] = useState<Partial<LookupRow>>({});
  const [masterAdding, setMasterAdding] = useState(false);

  type ConfirmDeleteState = { type: string; id: number } | null;
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>(null);

  // -------------- SETUP USER EMAIL --------------
  useEffect(() => {
  const stored = localStorage.getItem("user");
  if (stored) {
    try {
      const obj = JSON.parse(stored);
      setUserName(obj.name  || "");
    } catch {}
  }
}, []);

  // ------------- DEBOUNCED PRODUCT SEARCH --------------
  const debouncedSetSearchProduct = useMemo(
    () => debounce((value: string) => setSearchProduct(value), 400),
    []
  );
  useEffect(
    () => () => debouncedSetSearchProduct.cancel(),
    [debouncedSetSearchProduct]
  );

  // --------------- FETCH LOOKUP DATA -----------------
  const fetchLookups = useCallback(async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      const [p, t, pc, sz, pk, tm, c] = await Promise.all([
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
        axios.get(API.LOOKUP.TERMINALS, {
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
        terminals: tm.data,
        customers: c.data,
      });
    } catch {
      setError("Failed to load lookups.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------- FETCH ORDERS -----------------
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const isSearching = !!(searchProduct || searchDate);

    try {
      const res = await axios.get(API.ADMIN.SALES_ORDERS, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          ...(isSearching
            ? { limit: 10000 }
            : { page: currentPage, limit: pageSize }),
          search: searchInput || undefined,
          date: formatDateLocalYYYYMMDD(searchDate),
        },
      });
      setOrders(res.data.data || []);
      setTotalOrders(
        isSearching ? res.data.data?.length || 0 : res.data.total || 0
      );
    } catch (err: any) {
      let msg = "Failed to fetch orders.";
      const data = err.response?.data;
      if (data?.message) {
        msg =
          typeof data.message === "string"
            ? data.message
            : JSON.stringify(data.message);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchProduct, searchInput, searchDate]);

  // --- Fetch data when view is 'orders'
  useEffect(() => {
    if (view === "orders") {
      fetchLookups();
      fetchOrders();
    }
  }, [view, fetchLookups, fetchOrders]);

  // --- Refetch orders on filter/search change
  useEffect(() => {
    if (view === "orders") {
      fetchOrders();
    }
  }, [currentPage, searchInput, searchDate, view, fetchOrders]);

  // ------------- INLINE UPDATE ONLY FOR STATUS, PRIORITY, TERMINAL -----------------
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

      if (field === "priority" || field === "terminalId") {
        value = editValue === "" ? null : Number(editValue);
      } else if (field === "status") {
        value = editValue;
      }

      await axios.patch(
        API.ADMIN.SALES_ORDER_BY_ID(row.id),
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingCell(null);
      setEditValue("");
      toast.success("Updated!");
      fetchOrders();
    } catch (e) {
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const startCellEdit = (row: SalesOrder, field: EditableField) => {
    // Only allow inline edit for allowed fields
    if (!INLINE_EDIT_FIELDS.includes(field)) return;
    setEditingCell({ id: row.id, field });
    const value = row[field];
    setEditValue(value !== undefined && value !== null ? String(value) : "");
  };

  const cancelCellEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: SalesOrder
  ) => {
    if (e.key === "Enter") saveCellEdit(row);
    else if (e.key === "Escape") cancelCellEdit();
  };

  const onOrderDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(API.ADMIN.SALES_ORDER_BY_ID(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order deleted successfully.");
      fetchOrders(); // Or your refresh logic
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
      toast.error(message);
    }
  };

  // ---------- Modal Save (edit all fields except deliveryDate) ----------
  const updateOrderModal = async (
    orderId: number,
    patch: Partial<SalesOrder>
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Only pick allowed fields (never send forbidden fields)
      const {
        saleOrderNumber,
        outboundDelivery,
        transferOrder,
        transporterId,
        productId,
        plantCodeId,
        paymentClearance,
        salesZoneId,
        packConfigId,
        status,
        priority,
        terminalId,
        specialRemarks,
        // deliveryDate // Exclude editing deliveryDate
      } = patch;

      // Only build PATCH object with allowed keys
      const payload: any = {};
      if (saleOrderNumber !== undefined)
        payload.saleOrderNumber = saleOrderNumber;
      if (outboundDelivery !== undefined)
        payload.outboundDelivery = outboundDelivery;
      if (transferOrder !== undefined) payload.transferOrder = transferOrder;
      if (productId !== undefined && productId !== null)
        payload.productId = Number(productId);
      if (plantCodeId !== undefined && plantCodeId !== null)
        payload.plantCodeId = Number(plantCodeId);
      if (transporterId !== undefined && transporterId !== null)
        payload.transporterId = Number(transporterId);
      if (salesZoneId !== undefined && salesZoneId !== null)
        payload.salesZoneId = Number(salesZoneId);
      if (packConfigId !== undefined && packConfigId !== null)
        payload.packConfigId = Number(packConfigId);
      if (terminalId !== undefined && terminalId !== null)
        payload.terminalId = Number(terminalId);
      if (priority !== undefined && priority !== null)
        payload.priority = Number(priority);

      if (specialRemarks !== undefined) payload.specialRemarks = specialRemarks;

      await axios.patch(API.ADMIN.SALES_ORDER_BY_ID(orderId), payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order updated.");
      fetchOrders();
    } catch (e) {
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  // ------------- FILTERS -------------
  const handleClearFilters = () => {
    setSearchInput("");
    setSearchDate(undefined);
    setCurrentPage(1);
  };

  // --------------- MASTER LOOKUP LOGIC ---------------
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
        case "terminals":
          url = API.LOOKUP.TERMINALS;
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

  // --- Master CRUD ---
  const onMasterEdit = (id: number, row: LookupRow) => {
    setMasterEditingId(id);
    setMasterEditObj(row);
  };

  const onMasterEditChange = (
    key: string,
    value: string | number | boolean | null | undefined
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
        case "terminals":
          url = API.LOOKUP.TERMINAL_BY_ID(id);
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
      toast.success("Updated successfully.");
    } catch {
      toast.error("Update failed.");
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
        case "terminals":
          url = API.LOOKUP.TERMINAL_BY_ID(id);
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
      toast.success("Deleted successfully.");
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
      toast.error(message);
    }
    setMasterLookupLoading(false);
  };

  const onMasterCancel = () => setMasterEditingId(null);

  const onMasterAddChange = (
    key: string,
    value: string | number | boolean | null | undefined
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
        case "terminals":
          url = API.LOOKUP.TERMINALS;
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
      toast.error(message);
    }
    setMasterAdding(false);
  };

  // ------------ EXPORT ALL STATE/FUNCTIONS ------------
  return {
    // General
    userName,
    view,
    setView,
    error,
    setError,

    // Orders
    orders,
    lookup,
    currentPage,
    setCurrentPage,
    pageSize,
    totalOrders,
    editingCell,
    editValue,
    startCellEdit,
    setEditValue,
    saveCellEdit,
    cancelCellEdit,
    handleInputKeyDown,
    loading,
    updateOrderModal, // For edit modal

    // Search UI state
    searchInput,
    setSearchInput,
    searchProduct,
    setSearchProduct,
    searchDate,
    setSearchDate,
    openCalendar,
    setOpenCalendar,
    handleClearFilters,

    onOrderDelete,

    // Master lookup
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

    // Delete confirm
    confirmDelete,
    setConfirmDelete,
  };
}
