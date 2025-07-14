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
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { motion } from "framer-motion";
import AnimatedPage from "@/app/components/AnimatedPage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import debounce from "lodash.debounce";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import { API } from "@/lib/api";

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
  specialRemarks?: string | null;
};

const pageSize = 10;

type Lookup = {
  products: { id: number; name: string }[];
  transporters: { id: number; name: string }[];
  plantCodes: { id: number; code: string }[];
  salesZones: { id: number; name: string }[];
  packConfigs: { id: number; configName: string }[];
};

type EditingCell = { id: number; field: "status" | "priority" } | null;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Custom dark-mode styles for react-datepicker
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

export default function AdminDashboard() {
  // Add dark theme DatePicker styles
  useEffect(() => {
    let style = document.getElementById("datepicker-dark");
    if (!style) {
      style = document.createElement("style");
      style.id = "datepicker-dark";
      style.innerHTML = datePickerCustomStyles;
      document.head.appendChild(style);
    }
  }, []);

  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [lookup, setLookup] = useState<Lookup>({
    products: [],
    transporters: [],
    plantCodes: [],
    salesZones: [],
    packConfigs: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Pagination and search/filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchProduct, setSearchProduct] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);

  // Inline edit state
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [editValue, setEditValue] = useState<string>("");

  const [open, setOpen] = useState(false);

  // Determine if currently searching (product/date/both)
  const isSearching = !!(searchProduct || searchDate);

  // Debounced product search
  const debouncedSetSearchProduct = useMemo(
    () => debounce((value: string) => setSearchProduct(value), 400),
    []
  );
  useEffect(
    () => () => debouncedSetSearchProduct.cancel(),
    [debouncedSetSearchProduct]
  );

  // User info for greeting
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUserEmail(JSON.parse(stored).email || "");
      } catch {}
    }
  }, []);

  // Fetch lookups and orders on mount/search/pagination
  useEffect(() => {
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
    ])
      .then(([p, t, pc, sz, pk]) => {
        setLookup({
          products: p.data,
          transporters: t.data,
          plantCodes: pc.data,
          salesZones: sz.data,
          packConfigs: pk.data,
        });
      })
      .catch(() => setError("Failed to load lookups."));

    fetchOrders();
    // eslint-disable-next-line
  }, [currentPage, searchProduct, searchDate]);

  // FETCH ORDERS: key update here
  const fetchOrders = () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    axios
      .get(API.ADMIN.SALES_ORDERS, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          ...(isSearching
            ? {
                // fetch all matches when searching (remove pagination)
                limit: 10000, // or a sufficiently large number based on backend capability
              }
            : {
                page: currentPage,
                limit: pageSize,
              }),
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
      })
      .catch(() => setError("Failed to fetch orders."))
      .finally(() => setLoading(false));
  };

  // Inline edit handlers
  const startCellEdit = (row: SalesOrder, field: "status" | "priority") => {
    setEditingCell({ id: row.id, field });
    setEditValue(
      field === "priority"
        ? row.priority === null || row.priority === undefined
          ? ""
          : String(row.priority)
        : row.status || ""
    );
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
      await axios.patch(
        API.ADMIN.SALES_ORDER_BY_ID(row.id),
        {
          [editingCell.field]:
            editingCell.field === "priority"
              ? editValue === ""
                ? null
                : Number(editValue)
              : editValue,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCell(null);
      setEditValue("");
      fetchOrders();
    } catch {
      setLoading(false);
      alert("Update failed.");
    }
  };
  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: SalesOrder
  ) => {
    if (e.key === "Enter") saveCellEdit(row);
    else if (e.key === "Escape") cancelCellEdit();
  };

  // Helpers
  // 1. Overloads for different lookups
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

  // 2. Implementation
  function findName(
    arr: Array<{ id: number } & Record<string, any>>,
    id: number,
    field: string = "name"
  ): string {
    const item = arr.find((x) => x.id === id);
    if (!item) return "-";
    return typeof item[field] === "string" ? item[field] : "-";
  }

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const [y, m, d] = iso.split("T")[0].split("-");
    return `${d}-${m}-${y}`;
  };

  // Table classes to match sales dashboard
  const thClass =
    "px-3 py-2 border border-gray-200 dark:border-zinc-700 text-center whitespace-nowrap";
  const tdClass =
    "px-3 py-2 border border-gray-200 dark:border-zinc-700 text-center";

  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));

  if (loading)
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <LoadingSpinner text="Loading" />
      </div>
    );
  if (error)
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-lg text-red-600">
        {error}
      </div>
    );

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-background p-0 w-full">
        {/* Header */}
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
          <Button
            variant="redOutline"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="mr-10 px-6 py-2"
          >
            LOGOUT
          </Button>
        </div>

        {/* Controls */}
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
                    setSearchInput(e.target.value);
                    debouncedSetSearchProduct(e.target.value);
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
                      {/* Clear button below calendar (optional) */}
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

            {/* Table */}
            <table className="w-full text-left text-[15px] border-collapse">
              <thead>
                <tr className="bg-blue-400 dark:bg-blue-400">
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
                    "Remarks",
                  ].map((h) => (
                    <th key={h} className={thClass}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={15} className={tdClass}>
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((row, i) => (
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
                      <td className={tdClass}>
                        {row.product?.name ||
                          findName(lookup.products, row.productId!) ||
                          "-"}
                      </td>
                      <td className={tdClass}>{row.saleOrderNumber || "-"}</td>
                      <td className={tdClass}>{row.outboundDelivery || "-"}</td>
                      <td className={tdClass}>{row.transferOrder || "-"}</td>
                      <td className={tdClass}>
                        {row.deliveryDate ? formatDate(row.deliveryDate) : "-"}
                      </td>
                      <td className={tdClass}>
                        {row.transporter?.name ||
                          findName(lookup.transporters, row.transporterId!) ||
                          "-"}
                      </td>
                      <td className={tdClass}>
                        {row.plantCode?.code ||
                          findName(
                            lookup.plantCodes,
                            row.plantCodeId!,
                            "code"
                          ) ||
                          "-"}
                      </td>
                      <td className={tdClass}>
                        {row.paymentClearance ? "Yes" : "No"}
                      </td>
                      <td className={tdClass}>
                        {row.salesZone?.name ||
                          findName(lookup.salesZones, row.salesZoneId!) ||
                          "-"}
                      </td>
                      <td className={tdClass}>
                        {row.packConfig?.configName ||
                          findName(
                            lookup.packConfigs,
                            row.packConfigId!,
                            "configName"
                          ) ||
                          "-"}
                      </td>
                      {/* --- STATUS (inline edit) --- */}
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
                      {/* --- PRIORITY (inline edit) --- */}
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
                      <td className={tdClass}>{row.specialRemarks || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
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
      </div>
    </AnimatedPage>
  );
}
