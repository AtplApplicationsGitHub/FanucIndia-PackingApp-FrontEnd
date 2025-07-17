"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Save,
  PlusCircle,
  X,
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { motion } from "framer-motion";
import AnimatedPage from "@/app/components/AnimatedPage";
import "react-datepicker/dist/react-datepicker.css";
import debounce from "lodash.debounce";
import { API } from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";

// ---------- Types ----------
type SalesOrder = {
  id: number;
  user?: { email?: string } | null;
  userId?: string | number;
  product?: { name?: string } | null;
  productId?: number;
  saleOrderNumber?: string;
  outboundDelivery?: string;
  transferOrder?: string;
  deliveryDate?: string;
  transporter?: { name?: string } | null;
  transporterId?: number;
  plantCode?: { code?: string } | null;
  plantCodeId?: number;
  paymentClearance?: boolean;
  salesZone?: { name?: string } | null;
  salesZoneId?: number;
  packConfig?: { configName?: string } | null;
  packConfigId?: number;
  status?: string | null;
  priority?: number | null;
  terminal?: { name?: string } | null;
  terminalId?: number;
  specialRemarks?: string | null;
};

const pageSize = 10;

type Lookup = {
  products: { id: number; name: string }[];
  transporters: { id: number; name: string }[];
  plantCodes: { id: number; code: string }[];
  salesZones: { id: number; name: string }[];
  packConfigs: { id: number; configName: string }[];
  terminals: { id: number; name: string }[];
};

export type LookupRow = {
  id: number;
  [key: string]: string | number | boolean | null | undefined;
};

// Used for master lookups; every row must have at least `id`
export type MasterRow = {
  id: number;
  [key: string]: string | number | boolean | null | undefined;
};

type EditableField =
  | "productId"
  | "saleOrderNumber"
  | "outboundDelivery"
  | "transferOrder"
  | "deliveryDate"
  | "transporterId"
  | "plantCodeId"
  | "paymentClearance"
  | "salesZoneId"
  | "packConfigId"
  | "status"
  | "priority"
  | "terminalId"
  | "specialRemarks";

type EditingCell = { id: number; field: EditableField } | null;

// --------- Constants ----------
const MASTER_LOOKUP_OPTIONS = [
  { label: "Products", key: "products" },
  { label: "Transporter", key: "transporters" },
  { label: "Delivery Plant Code", key: "plantCodes" },
  { label: "Sales Zone", key: "salesZones" },
  { label: "Packing Configuration", key: "packConfigs" },
  { label: "Terminals", key: "terminals" },
  { label: "Customers", key: "customers" },
  { label: "Printers", key: "printers" },
];

// --------- Utility Functions ----------
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const datePickerCustomStyles = `
.react-datepicker-popper[data-theme="dark"] .react-datepicker,
.react-datepicker[data-theme="dark"] {
  background: #18181b;
  color: #fff;
  border-color: #27272a;
}
.react-datepicker-popper[data-theme="dark"] .react-datepicker__header,
.react-datepicker[data-theme="dark"] .react-datepicker__header {
  background: #22223b;
  border-bottom: 1px solid #27272a;
}
.react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
  background-color: #2563eb !important;
  color: #fff !important;
}
.react-datepicker__day:hover {
  background-color: #334155 !important;
  color: #fff !important;
}
`;

// --------- Main Component ----------
export default function AdminDashboard() {
  useEffect(() => {
    let style = document.getElementById("datepicker-dark");
    if (!style) {
      style = document.createElement("style");
      style.id = "datepicker-dark";
      style.innerHTML = datePickerCustomStyles;
      document.head.appendChild(style);
    }
  }, []);

  // -- State for Orders Mode --
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [lookup, setLookup] = useState<Lookup>({
    products: [],
    transporters: [],
    plantCodes: [],
    salesZones: [],
    packConfigs: [],
    terminals: [],
  });
  const [, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [open, setOpen] = useState(false);

  // -- Mode Toggle --
  const [view, setView] = useState<"orders" | "master" | "">("");
  const [selectedMasterLookup, setSelectedMasterLookup] = useState(
    MASTER_LOOKUP_OPTIONS[0].key
  );

  // -- Master Table State --
  const [masterLookupData, setMasterLookupData] = useState<LookupRow[]>([]);
  const [masterLookupLoading, setMasterLookupLoading] = useState(false);
  const [masterLookupError, setMasterLookupError] = useState("");
  const [masterEditingId, setMasterEditingId] = useState<number | null>(null);
  const [masterEditObj, setMasterEditObj] = useState<Partial<LookupRow>>({});
  const [masterAddObj, setMasterAddObj] = useState<Partial<LookupRow>>({});
  const [masterAdding, setMasterAdding] = useState(false);

  type ConfirmDeleteState = { type: string; id: number } | null;
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>(null);

  // -- Orders Filtering --
  const filteredOrders = orders.filter((order) => {
    const search = searchInput.toLowerCase();
    return (
      order.saleOrderNumber?.toLowerCase().includes(search) ||
      order.outboundDelivery?.toLowerCase().includes(search) ||
      order.transferOrder?.toLowerCase().includes(search) ||
      order.specialRemarks?.toLowerCase().includes(search) ||
      order.status?.toLowerCase().includes(search) ||
      order.product?.name?.toLowerCase().includes(search) ||
      order.transporter?.name?.toLowerCase().includes(search) ||
      order.plantCode?.code?.toLowerCase().includes(search) ||
      order.salesZone?.name?.toLowerCase().includes(search) ||
      order.packConfig?.configName?.toLowerCase().includes(search)
    );
  });
  const isSearching = !!(searchProduct || searchDate);

  // -- Debounced Product Search --
  const debouncedSetSearchProduct = useMemo(
    () => debounce((value: string) => setSearchProduct(value), 400),
    []
  );
  useEffect(
    () => () => debouncedSetSearchProduct.cancel(),
    [debouncedSetSearchProduct]
  );

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUserEmail(JSON.parse(stored).email || "");
      } catch {}
    }
  }, []);

  // -- Fetch Orders and Lookups --
  useEffect(() => {
    if (view !== "orders") return;
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
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
      axios.get(API.LOOKUP.TERMINALS, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([p, t, pc, sz, pk, tm]) => {
        setLookup({
          products: p.data,
          transporters: t.data,
          plantCodes: pc.data,
          salesZones: sz.data,
          packConfigs: pk.data,
          terminals: tm.data,
        });
      })
      .catch(() => setError("Failed to load lookups."));
    fetchOrders();
    // eslint-disable-next-line
  }, [currentPage, searchProduct, searchDate, view]);

  const fetchOrders = () => {
    const token = localStorage.getItem("token");
    axios
      .get(API.ADMIN.SALES_ORDERS, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          ...(isSearching
            ? { limit: 10000 }
            : { page: currentPage, limit: pageSize }),
          product: searchProduct || undefined,
          date: searchDate
            ? `${searchDate.getFullYear()}-${String(
                searchDate.getMonth() + 1
              ).padStart(2, "0")}-${String(searchDate.getDate()).padStart(
                2,
                "0"
              )}`
            : undefined,
        },
      })
      .then((res) => {
        setOrders(res.data.data || []);
        setTotalOrders(
          isSearching ? res.data.data?.length || 0 : res.data.total || 0
        );
        setLoading(false);
      })
      .catch((err) => {
        let msg = "Failed to fetch orders.";
        const data = err.response?.data;
        if (data?.message) {
          msg =
            typeof data.message === "string"
              ? data.message
              : JSON.stringify(data.message);
        }
        setError(msg);
        setLoading(false);
      });
  };

  // -- Master Lookup Fetcher --
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
    } catch (error: unknown) {
      setMasterLookupError("Failed to load lookup.");
    }
    setMasterLookupLoading(false);
  };
  useEffect(() => {
    if (view === "master" && selectedMasterLookup) {
      fetchMasterLookup(selectedMasterLookup);
    }
  }, [view, selectedMasterLookup]);

  // -- CRUD Actions for Lookup Master --
  const handleMasterEdit = (id: number, row: LookupRow) => {
    setMasterEditingId(id);
    setMasterEditObj(row);
  };
  const handleMasterEditChange = (key: string, value: string | number | boolean | null | undefined) => {
    setMasterEditObj((obj) => ({ ...obj, [key]: value }));
  };
  const handleMasterEditSave = async (type: string, id: number) => {
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
  const handleMasterDelete = async (type: string, id: number) => {
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
        message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(`An error occured`);
    }
    setMasterLookupLoading(false);
  };
  const handleMasterAddChange = (
    key: string,
    value: string | number | boolean | null | undefined
  ) => {
    setMasterAddObj((obj) => ({ ...obj, [key]: value }));
  };
  const handleMasterAdd = async (type: string) => {
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
        message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(`An error occurred`);
    }
    setMasterAdding(false);
  };

  // ---------- UI Functions ----------
  function renderHeader() {
    return (
      <div className="w-full flex justify-between items-center py-4 px-8 bg-white dark:bg-zinc-900 shadow">
        <span className="text-lg font-semibold">
          {getGreeting()}
          {userEmail && (
            <>
              ,{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {userEmail}
              </span>
            </>
          )}
        </span>
        <div className="flex items-center gap-3">
          <Button
            variant={view === "orders" ? "ghost" : "outline"}
            className="px-5 py-2 rounded-none border border-blue-500 text-blue-600 dark:text-blue-400"
            onClick={() => setView("orders")}
          >
            ORDER LIST
          </Button>
          <Button
            variant={view === "master" ? "ghost" : "outline"}
            className="px-5 py-2 rounded-none border border-blue-500 text-blue-600 dark:text-blue-400"
            onClick={() => setView("master")}
          >
            MASTER
          </Button>
          <Button
            variant="redOutline"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="ml-20 mr-10 px-6 py-2"
          >
            LOGOUT
          </Button>
        </div>
      </div>
    );
  }

  function renderMasterLookup() {
    return (
      <div className="w-full flex flex-col items-center mt-8">
        <div className="flex flex-col md:flex-row gap-3 w-full max-w-xl">
          <label className="text-[16px] font-semibold mt-1">Lookup Type</label>
          <select
            className="border border-gray-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-900 text-base rounded-md w-full"
            value={selectedMasterLookup}
            onChange={(e) => setSelectedMasterLookup(e.target.value)}
          >
            {MASTER_LOOKUP_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {/* Table or loading/error */}
        <div className="w-full mt-8 max-w-3xl">
          {masterLookupLoading ? (
            <div className="text-center py-10 text-lg">Loading...</div>
          ) : masterLookupError ? (
            <div className="text-center py-10 text-red-600">
              {masterLookupError}
            </div>
          ) : (
            <LookupCrudTable
              type={selectedMasterLookup}
              data={masterLookupData}
              refresh={() => fetchMasterLookup(selectedMasterLookup)}
              editingId={masterEditingId}
              onEdit={handleMasterEdit}
              editObj={masterEditObj}
              onEditChange={handleMasterEditChange}
              onSave={handleMasterEditSave}
              onRequestDelete={handleMasterDelete}
              onCancel={() => setMasterEditingId(null)}
              addObj={masterAddObj}
              onAddChange={handleMasterAddChange}
              onAdd={handleMasterAdd}
              adding={masterAdding}
            />
          )}
        </div>
      </div>
    );
  }

  // ----------- RENDER -----------
  if (error)
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-lg text-red-600">
        {error}
      </div>
    );

  const thClass =
    "px-3 py-2 border border-gray-200 dark:border-zinc-700 text-center whitespace-nowrap";
  const tdClass =
    "px-3 py-2 border border-gray-200 dark:border-zinc-700 text-center";
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));

  // ---------------- Inline edit handlers ----------------
  const startCellEdit = (row: SalesOrder, field: EditableField) => {
    setEditingCell({ id: row.id, field });

    const value = row[field];
    if (field === "priority" && typeof value === "number") {
      setEditValue(String(value));
    } else if (field === "paymentClearance") {
      setEditValue(value ? "true" : "false");
    } else if (field === "deliveryDate" && typeof value === "string") {
      setEditValue(value.split("T")[0]); // for ISO to yyyy-mm-dd
    } else if (
      typeof value === "string" ||
      typeof value === "number" ||
      value === null ||
      value === undefined
    ) {
      setEditValue(String(value ?? ""));
    }
  };

  const cancelCellEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const saveCellEdit = async (row: SalesOrder) => {
    if (!editingCell) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const field = editingCell.field;

      let value: string | number | boolean | null = editValue;

      if (
        [
          "priority",
          "productId",
          "transporterId",
          "plantCodeId",
          "salesZoneId",
          "packConfigId",
          "terminalId",
        ].includes(field)
      ) {
        value = editValue === "" ? null : Number(editValue);
      } else if (field === "paymentClearance") {
        value = editValue === "true";
      }

      await axios.patch(
        API.ADMIN.SALES_ORDER_BY_ID(row.id),
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingCell(null);
      setEditValue("");
      fetchOrders();
    } catch (error: unknown) {
      toast.error("Update failed.");
      setLoading(false);
    }
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: SalesOrder
  ) => {
    if (e.key === "Enter") saveCellEdit(row);
    else if (e.key === "Escape") cancelCellEdit();
  };

  // ---------------- Helpers ----------------
  // Overloads for different lookups
  function findName(arr: { id: number; name: string }[], id: number): string;
  function findName(
    arr: { id: number; code: string }[],
    id: number,
    field: "code"
  ): string;
  function findName(
    arr: { id: number; configName: string }[],
    id: number,
    field: "configName"
  ): string;

  function findName(
    arr: Array<{ id: number } & Record<string, unknown>>,
    id: number,
    field: string = "name"
  ): string {
    const item = arr.find((x) => x.id === id);
    if (!item) return "-";
    const value = item[field as keyof typeof item];
    return typeof value === "string" ? value : "-";
  }

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const [y, m, d] = iso.split("T")[0].split("-");
    return `${d}-${m}-${y}`;
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-background p-0 w-full">
        {renderHeader()}
        {view === "" && (
          <div className="min-h-[40vh] flex items-center justify-center text-2xl font-bold text-blue-800 dark:text-blue-300">
            Welcome
          </div>
        )}
        {view === "orders" ? (
          // ================== ORDERS TABLE UI ==================
          <div className="py-8 w-full grid grid-cols-12 gap-0">
            <div className="col-span-12">
              <motion.div
                initial={{ opacity: 0, y: -30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col md:flex-row justify-between items-center mb-8 px-4 space-y-3 md:space-y-0 md:space-x-4"
              >
                <h1 className="text-3xl font-bold text-black dark:text-white mb-2 md:mb-0">
                  Orders List
                </h1>
                <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
                  <Input
                    type="text"
                    placeholder="Search Product"
                    className="border border-gray-200 dark:border-zinc-700 rounded-none px-3 py-2 bg-white dark:bg-zinc-900 text-[15px] w-full md:w-auto"
                    value={searchInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchInput(value);
                      setSearchProduct(value);
                      setCurrentPage(1);
                    }}
                  />
                  <div className="relative w-full md:w-auto">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`
        w-full md:w-auto justify-start text-left
        font-normal bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white
        border border-gray-200 dark:border-zinc-700
        px-3 py-2
        ${searchDate ? "" : "text-muted-foreground"}
        rounded-none
      `}
                          aria-label="Select date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {searchDate ? (
                            format(searchDate, "dd-MM-yyyy")
                          ) : (
                            <span>Filter by Date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 bg-white dark:bg-zinc-900 rounded-none w-auto">
                        <Calendar
                          mode="single"
                          selected={searchDate}
                          onSelect={(date) => {
                            setSearchDate(date);
                            setCurrentPage(1);
                            setOpen(false);
                          }}
                          className="bg-white dark:bg-zinc-900 text-black dark:text-white"
                          initialFocus
                        />
                        {searchDate && (
                          <div className="flex justify-end p-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-none"
                              onClick={() => setSearchDate(undefined)}
                            >
                              Clear
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchInput("");
                      setSearchProduct("");
                      setSearchDate(undefined);
                      setCurrentPage(1);
                    }}
                    className="ml-1 px-5 py-2 rounded-none"
                  >
                    CLEAR
                  </Button>
                </div>
              </motion.div>
              <table className="w-full text-left text-[15px] border-collapse">
                <thead>
                  <tr className="bg-[#5781e9] dark:bg-[#3b579d]">
                    {[
                      "S.I No",
                      "User Email",
                      "Product",
                      "Sales No",
                      "OB Delivery",
                      "Transfer",
                      "Req. Date",
                      "Transporter",
                      "Plant Code",
                      "Pay",
                      "Sales Zone",
                      "Pack Config",
                      "Status",
                      "Priority",
                      "Terminal",
                      "Remarks",
                    ].map((h) => (
                      <th key={h} className={thClass}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={16} className={`${tdClass} py-8`}>
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <p className="text-gray-600 dark:text-gray-300 text-base">
                            No orders found for your filter.
                          </p>
                          <Button
                            variant="outline"
                            className="rounded-md px-4 py-1 text-sm"
                            onClick={() => {
                              setSearchInput("");
                              setSearchProduct("");
                              setSearchDate(undefined);
                              setCurrentPage(1);
                            }}
                          >
                            Reset Filters
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((row, i) => (
                      <tr
                        key={row.id}
                        className="border-b hover:bg-blue-50 dark:hover:bg-zinc-800"
                      >
                        <td className={tdClass}>
                          {isSearching
                            ? i + 1
                            : (currentPage - 1) * pageSize + i + 1}
                        </td>
                        <td className={tdClass}>{row.user?.email || "-"}</td>
                        <td
                          className={tdClass}
                          onDoubleClick={() => startCellEdit(row, "productId")}
                          title="Double-click to edit"
                          style={{ cursor: "pointer" }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell.field === "productId" ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveCellEdit(row)}
                              className="border rounded px-2 py-1 w-32 bg-white dark:bg-zinc-900"
                              autoFocus
                            >
                              <option value="">Select</option>
                              {lookup.products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            row.product?.name ||
                            findName(lookup.products, row.productId!) ||
                            "-"
                          )}
                        </td>

                        <td
                          className={tdClass}
                          onDoubleClick={() =>
                            startCellEdit(row, "saleOrderNumber")
                          }
                          title="Double-click to edit"
                          style={{ cursor: "pointer" }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell.field === "saleOrderNumber" ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveCellEdit(row)}
                              onKeyDown={(e) => handleInputKeyDown(e, row)}
                              autoFocus
                              className="border rounded px-2 py-1 w-32 bg-white dark:bg-zinc-900"
                            />
                          ) : (
                            row.saleOrderNumber || "-"
                          )}
                        </td>

                        <td
                          className={tdClass}
                          onDoubleClick={() =>
                            startCellEdit(row, "outboundDelivery")
                          }
                          title="Double-click to edit"
                          style={{ cursor: "pointer" }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell.field === "outboundDelivery" ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveCellEdit(row)}
                              onKeyDown={(e) => handleInputKeyDown(e, row)}
                              autoFocus
                              className="border rounded px-2 py-1 w-32 bg-white dark:bg-zinc-900"
                            />
                          ) : (
                            row.outboundDelivery || "-"
                          )}
                        </td>

                        <td
                          className={tdClass}
                          onDoubleClick={() =>
                            startCellEdit(row, "transferOrder")
                          }
                          title="Double-click to edit"
                          style={{ cursor: "pointer" }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell.field === "transferOrder" ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveCellEdit(row)}
                              onKeyDown={(e) => handleInputKeyDown(e, row)}
                              autoFocus
                              className="border rounded px-2 py-1 w-32 bg-white dark:bg-zinc-900"
                            />
                          ) : (
                            row.transferOrder || "-"
                          )}
                        </td>

                        <td className={tdClass}>
                          {row.deliveryDate
                            ? formatDate(row.deliveryDate)
                            : "-"}
                        </td>

                        <td
                          className={tdClass}
                          onDoubleClick={() =>
                            startCellEdit(row, "transporterId")
                          }
                          title="Double-click to edit"
                          style={{ cursor: "pointer" }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell.field === "transporterId" ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveCellEdit(row)}
                              className="border rounded px-2 py-1 w-32 bg-white dark:bg-zinc-900"
                              autoFocus
                            >
                              <option value="">Select</option>
                              {lookup.transporters.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            row.transporter?.name ||
                            findName(lookup.transporters, row.transporterId!) ||
                            "-"
                          )}
                        </td>

                        <td
                          className={tdClass}
                          onDoubleClick={() =>
                            startCellEdit(row, "plantCodeId")
                          }
                          title="Double-click to edit"
                          style={{ cursor: "pointer" }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell.field === "plantCodeId" ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveCellEdit(row)}
                              className="border rounded px-2 py-1 w-28 bg-white dark:bg-zinc-900"
                              autoFocus
                            >
                              <option value="">Select</option>
                              {lookup.plantCodes.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.code}
                                </option>
                              ))}
                            </select>
                          ) : (
                            row.plantCode?.code ||
                            findName(
                              lookup.plantCodes,
                              row.plantCodeId!,
                              "code"
                            ) ||
                            "-"
                          )}
                        </td>

                        <td
                          className={tdClass}
                          onDoubleClick={() =>
                            startCellEdit(row, "paymentClearance")
                          }
                          title="Double-click to edit"
                          style={{ cursor: "pointer" }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell.field === "paymentClearance" ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveCellEdit(row)}
                              className="border rounded px-2 py-1 w-20 bg-white dark:bg-zinc-900"
                              autoFocus
                            >
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : row.paymentClearance ? (
                            "Yes"
                          ) : (
                            "No"
                          )}
                        </td>

                        <td
                          className={tdClass}
                          onDoubleClick={() =>
                            startCellEdit(row, "salesZoneId")
                          }
                          title="Double-click to edit"
                          style={{ cursor: "pointer" }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell.field === "salesZoneId" ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveCellEdit(row)}
                              className="border rounded px-2 py-1 w-32 bg-white dark:bg-zinc-900"
                              autoFocus
                            >
                              <option value="">Select</option>
                              {lookup.salesZones.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            row.salesZone?.name ||
                            findName(lookup.salesZones, row.salesZoneId!) ||
                            "-"
                          )}
                        </td>

                        <td
                          className={tdClass}
                          onDoubleClick={() =>
                            startCellEdit(row, "packConfigId")
                          }
                          title="Double-click to edit"
                          style={{ cursor: "pointer" }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell.field === "packConfigId" ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveCellEdit(row)}
                              className="border rounded px-2 py-1 w-36 bg-white dark:bg-zinc-900"
                              autoFocus
                            >
                              <option value="">Select</option>
                              {lookup.packConfigs.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.configName}
                                </option>
                              ))}
                            </select>
                          ) : (
                            row.packConfig?.configName ||
                            findName(
                              lookup.packConfigs,
                              row.packConfigId!,
                              "configName"
                            ) ||
                            "-"
                          )}
                        </td>

                        {/* STATUS EDIT */}
                        <td
                          className={tdClass}
                          onDoubleClick={() => startCellEdit(row, "status")}
                          title="Double-click to edit"
                          style={{ cursor: "pointer" }}
                        >
                          {editingCell &&
                          editingCell.id === row.id &&
                          editingCell.field === "status" ? (
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-24 text-[15px] bg-white dark:bg-zinc-900"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveCellEdit(row)}
                              onKeyDown={(e) => handleInputKeyDown(e, row)}
                              autoFocus
                              maxLength={32}
                              placeholder="Type status"
                            />
                          ) : (
                            row.status || "-"
                          )}
                        </td>
                        {/* PRIORITY EDIT */}
                        <td
                          className={tdClass}
                          onDoubleClick={() => startCellEdit(row, "priority")}
                          title="Double-click to edit"
                          style={{ cursor: "pointer" }}
                        >
                          {editingCell &&
                          editingCell.id === row.id &&
                          editingCell.field === "priority" ? (
                            <input
                              type="number"
                              className="border rounded px-2 py-1 w-16 text-[15px] bg-white dark:bg-zinc-900"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveCellEdit(row)}
                              onKeyDown={(e) => handleInputKeyDown(e, row)}
                              autoFocus
                              maxLength={16}
                              placeholder="Type priority"
                            />
                          ) : row.priority !== undefined &&
                            row.priority !== null ? (
                            row.priority
                          ) : (
                            "-"
                          )}
                        </td>

                        <td
                          className={tdClass}
                          onDoubleClick={() => startCellEdit(row, "terminalId")}
                          title="Double-click to edit"
                          style={{ cursor: "pointer" }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell.field === "terminalId" ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveCellEdit(row)}
                              className="border rounded px-2 py-1 w-32 bg-white dark:bg-zinc-900"
                              autoFocus
                            >
                              <option value="">Select</option>
                              {lookup.terminals.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            row.terminal?.name ||
                            findName(lookup.terminals, row.terminalId!) ||
                            "-"
                          )}
                        </td>

                        <td
                          className={tdClass}
                          onDoubleClick={() =>
                            startCellEdit(row, "specialRemarks")
                          }
                          title="Double-click to edit"
                          style={{ cursor: "pointer" }}
                        >
                          {editingCell?.id === row.id &&
                          editingCell.field === "specialRemarks" ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveCellEdit(row)}
                              onKeyDown={(e) => handleInputKeyDown(e, row)}
                              autoFocus
                              className="border rounded px-2 py-1 w-44 bg-white dark:bg-zinc-900"
                            />
                          ) : (
                            row.specialRemarks || "-"
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination and info bar should be hidden if searching */}
              {totalOrders > 0 && !isSearching && (
                <div className="flex justify-between items-center mt-4 px-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, totalOrders)} of{" "}
                    {totalOrders} orders
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={20} />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      <ChevronRight size={20} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
        {view === "master" && renderMasterLookup()}
      </div>

      {confirmDelete && (
        <Dialog open={true} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <span className="font-bold text-lg">Are you sure?</span>
            </DialogHeader>
            <div>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={async () => {
                  await handleMasterDelete(
                    confirmDelete.type,
                    confirmDelete.id
                  );
                  setConfirmDelete(null);
                }}
              >
                Yes, Delete
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AnimatedPage>
  );
}

// --------- Lookup CRUD Table Component ----------
type LookupCrudTableProps = {
  type: string;
  data: LookupRow[];
  refresh: () => void;
  editingId: number | null;
  onEdit: (id: number, row: LookupRow) => void;
  editObj: Partial<LookupRow>;
  onEditChange: (
    key: string,
    value: string | number | boolean | null | undefined
  ) => void;
  onSave: (type: string, id: number) => void;
  onRequestDelete: (type: string, id: number) => void;
  onCancel: () => void;
  addObj: Partial<LookupRow>;
  onAddChange: (
    key: string,
    value: string | number | boolean | null | undefined
  ) => void;
  onAdd: (type: string) => void;
  adding: boolean;
};

function LookupCrudTable({
  type,
  data,
  editingId,
  onEdit,
  editObj,
  onEditChange,
  onSave,
  onRequestDelete,
  onCancel,
  addObj,
  onAddChange,
  onAdd,
  adding,
}: LookupCrudTableProps) {
  if (!data.length)
    return (
      <div className="py-4 text-gray-600 text-center">No items found.</div>
    );
  // Exclude 'id' for add/edit, but keep for display; exclude createdAt/updatedAt
  const columns = Object.keys(data[0]).filter(
    (col) => col !== "createdAt" && col !== "updatedAt"
  );

  return (
    <table className="w-full border mt-4 text-[15px]">
      <thead>
        <tr>
          <th className="border px-3 py-2">S.No</th>
          {columns.map((k) => (
            <th key={k} className="border px-3 py-2">
              {k}
            </th>
          ))}
          <th className="border px-3 py-2">Action</th>
        </tr>
      </thead>
      <tbody>
        {/* ADD NEW ROW (exclude id input) */}
        <tr>
          <td className="border px-3 py-2 text-center">-</td>
          {columns.map((col) =>
            col === "id" ? (
              <td key={col} className="border px-3 py-2 text-center">
                Auto
              </td>
            ) : (
              <td key={col} className="border px-3 py-2">
                <input
                  value={
                    typeof addObj[col] === "boolean"
                      ? String(addObj[col])
                      : addObj[col] ?? ""
                  }
                  onChange={(e) => onAddChange(col, e.target.value)}
                  className="border rounded px-2 py-1 bg-white dark:bg-zinc-900 w-full"
                  placeholder={col}
                />
              </td>
            )
          )}
          <td className="border px-3 py-2 text-center">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAdd(type)}
              disabled={adding}
            >
              <PlusCircle className="inline mr-1" size={16} />
              Add
            </Button>
          </td>
        </tr>
        {/* DATA ROWS */}
        {data.map((row, i) => (
          <tr key={row.id || i}>
            <td className="border px-3 py-2 text-center">{i + 1}</td>
            {columns.map((col) => (
              <td key={col} className="border px-3 py-2">
                {editingId === row.id && col !== "id" ? (
                  <input
                    value={
                      typeof editObj[col] === "boolean"
                        ? String(editObj[col])
                        : editObj[col] ?? ""
                    }
                    onChange={(e) => onEditChange(col, e.target.value)}
                    className="border rounded px-2 py-1 bg-white dark:bg-zinc-900 w-full"
                  />
                ) : col === "id" ? (
                  row[col]
                ) : (
                  String(row[col])
                )}
              </td>
            ))}
            <td className="border px-3 py-2 text-center">
              {editingId === row.id ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSave(type, row.id)}
                  >
                    <Save className="inline" size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onCancel}>
                    <X className="inline" size={16} />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(row.id, row)}
                  >
                    <Pencil className="inline" size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRequestDelete(type, row.id)}
                  >
                    <Trash2 className="inline" size={16} />
                  </Button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
