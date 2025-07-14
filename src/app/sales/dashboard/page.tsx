"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreVertical } from "lucide-react";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import AnimatedPage from "@/app/components/AnimatedPage";
import { useAutoLogout } from "@/hooks/useAutoLogout";
import { Modal } from "@/components/ui/Modal";
import { SalesEntryForm } from "@/app/components/SalesEntryForm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import { API } from "@/lib/api";
import { toast } from "sonner";

// Data types
type SalesOrder = {
  id: number;
  productId: number;
  saleOrderNumber: string;
  outboundDelivery: string;
  transferOrder: string;
  deliveryDate: string;
  transporterId: number;
  plantCodeId: number;
  paymentClearance: boolean;
  salesZoneId: number;
  packConfigId: number;
  specialRemarks: string;
};

type Product = { id: number; name: string };
type Transporter = { id: number; name: string };
type PlantCode = { id: number; code: string };
type SalesZone = { id: number; name: string };
type PackConfig = { id: number; configName: string };

// Util
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function SalesDashboard() {
  useAutoLogout(10);
  const router = useRouter();

  // ==== LOCK BACK BUTTON ON DASHBOARD ====
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, "", window.location.href);
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, []);

  // Route protection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";
  }, [router]);

  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookup, setLookup] = useState<{
    products: Product[];
    transporters: Transporter[];
    plantCodes: PlantCode[];
    salesZones: SalesZone[];
    packConfigs: PackConfig[];
  }>({
    products: [],
    transporters: [],
    plantCodes: [],
    salesZones: [],
    packConfigs: [],
  });
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(orders.length / pageSize);
  const pagedOrders = orders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // User email for greeting
  const [userEmail, setUserEmail] = useState("");
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUserEmail(JSON.parse(stored).email || "");
      } catch {}
    }
  }, []);

  // Download template
  const handleDownloadTemplate = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API.SALES.TEMPLATE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const disp = res.headers.get("content-disposition") || "";
      const fnMatch = disp.match(/filename="?(.+)"?/);
      const filename = fnMatch ? fnMatch[1] : "template.xlsx";
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.append(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download template");
    }
  };

  // Bulk upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleBulkUpload = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem("token");
    const fm = new FormData();
    fm.append("file", file);
    try {
      await axios.post(API.SALES.IMPORT, fm, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Bulk upload successful!");
      fetchOrders();
      setShowForm(false);
      setEditingOrder(null);
    } catch (err: unknown) {
      let msg = "Bulk upload failed. Check your file and try again.";
      let data: unknown = undefined;
      if (axios.isAxiosError(err)) {
        data = err.response?.data;
      }

      if (typeof data === "string") {
        msg = data;
      } else if (typeof data === "object" && data !== null) {
        // Check if 'message' property exists
        if ("message" in data) {
          const message = (data as { message?: unknown }).message;
          if (typeof message === "string") {
            msg = message;
          } else if (
            typeof message === "object" &&
            message !== null &&
            "message" in message &&
            typeof (message as any).message === "string"
          ) {
            msg = (message as any).message;
          } else if (typeof message === "object") {
            msg = JSON.stringify(message);
          }
        }
        // Check if 'error' property exists
        if (
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
        ) {
          msg = (data as { error: string }).error;
        }
        // Check for 'errors' array
        if (
          "errors" in data &&
          Array.isArray((data as { errors?: unknown }).errors)
        ) {
          msg += "\n" + (data as { errors: string[] }).errors.join(", ");
        }
        if (
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string" &&
          (data as { error: string }).error !== msg
        ) {
          msg += "\n" + (data as { error: string }).error;
        }
      }
      toast.error(msg);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Fetch lookups & orders on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
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
    ])
      .then(([p, t, pc, sz, pk]) => {
        setLookup({
          products: p.data,
          transporters: t.data,
          plantCodes: pc.data,
          salesZones: sz.data,
          packConfigs: pk.data,
        });
        setLookupsLoading(false);
      })
      .catch(() => setError("Failed to load lookups."));

    fetchOrders();
  }, []);

  const fetchOrders = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get(API.SALES.CRUD, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setOrders(res.data || []);
        setCurrentPage(1);
      })
      .catch(() => setError("Failed to fetch orders."))
      .finally(() => setLoading(false));
  };

  const thClass =
    "px-3 py-2 border border-gray-200 dark:border-zinc-700 text-center whitespace-nowrap";
  const tdClass =
    "px-3 py-2 border border-gray-200 dark:border-zinc-700 text-center";

  // Helpers
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

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split("T")[0].split("-");
    return `${d}-${m}-${y}`;
  };

  if (loading || lookupsLoading)
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
            className="px-6 py-2 mr-10"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
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
                Your Orders
              </h1>
              <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                <Button
                  variant="ghost"
                  className="rounded-none font-medium px-5 py-2 transition-colors"
                  onClick={() => {
                    setEditingOrder(null);
                    setShowForm(true);
                  }}
                >
                  CREATE ORDER
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-none font-medium px-5 py-2 transition-colors"
                  onClick={handleDownloadTemplate}
                >
                  DOWNLOAD EXCEL TEMPLATE
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-none font-medium px-5 py-2 transition-colors"
                  onClick={handleBulkUpload}
                >
                  BULK UPLOAD
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </motion.div>

            {orders.length === 0 ? (
              <Card className="flex items-center justify-center h-[40vh] w-full shadow-lg rounded-2xl text-2xl font-semibold text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900">
                No orders yet! Start by creating your first order.
              </Card>
            ) : (
              <>
                <table className="w-full text-left text-[15px] border-collapse">
                  <thead>
                    <tr className="bg-blue-400 dark:bg-blue-400">
                      {[
                        "S.I No",
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
                        "Remarks",
                        "Actions",
                      ].map((h) => (
                        <th key={h} className={thClass}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedOrders.map((o, i) => (
                      <tr
                        key={o.id}
                        className="border-b hover:bg-blue-50 dark:hover:bg-zinc-800"
                      >
                        <td className={tdClass}>
                          {(currentPage - 1) * pageSize + i + 1}
                        </td>
                        <td className={tdClass}>
                          {findName(lookup.products, o.productId)}
                        </td>
                        <td className={tdClass}>{o.saleOrderNumber || "-"}</td>
                        <td className={tdClass}>{o.outboundDelivery || "-"}</td>
                        <td className={tdClass}>{o.transferOrder || "-"}</td>
                        <td className={tdClass}>
                          {o.deliveryDate ? formatDate(o.deliveryDate) : "-"}
                        </td>
                        <td className={tdClass}>
                          {findName(lookup.transporters, o.transporterId)}
                        </td>
                        <td className={tdClass}>
                          {findName(lookup.plantCodes, o.plantCodeId, "code")}
                        </td>
                        <td className={tdClass}>
                          {o.paymentClearance ? "Yes" : "No"}
                        </td>
                        <td className={tdClass}>
                          {findName(lookup.salesZones, o.salesZoneId)}
                        </td>
                        <td className={tdClass}>
                          {findName(
                            lookup.packConfigs,
                            o.packConfigId,
                            "configName"
                          )}
                        </td>
                        <td className={tdClass}>{o.specialRemarks || "-"}</td>
                        <td className={tdClass}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                aria-label="Open menu"
                              >
                                <MoreVertical size={20} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={5}>
                              <DropdownMenuItem
                                onClick={() => {
                                  const cleanOrder = {
                                    id: o.id,
                                    productId: o.productId,
                                    saleOrderNumber: o.saleOrderNumber,
                                    outboundDelivery: o.outboundDelivery,
                                    transferOrder: o.transferOrder,
                                    deliveryDate: o.deliveryDate,
                                    transporterId: o.transporterId,
                                    plantCodeId: o.plantCodeId,
                                    paymentClearance: o.paymentClearance,
                                    salesZoneId: o.salesZoneId,
                                    packConfigId: o.packConfigId,
                                    specialRemarks: o.specialRemarks,
                                  };
                                  setEditingOrder(cleanOrder);
                                  setShowForm(true);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeletingId(o.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination controls */}
                {orders.length > 0 && (
                  <div className="flex justify-between items-center mt-4 px-2">
                    <span className="text-sm text-gray-700">
                      Showing {(currentPage - 1) * pageSize + 1} to{" "}
                      {Math.min(currentPage * pageSize, orders.length)} of{" "}
                      {orders.length} orders
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        aria-label="Next page"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal */}
        <Modal
          open={deletingId !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingId(null);
          }}
          title="Delete Order"
          description="Are you sure you want to delete this order? This action cannot be undone."
        >
          <div className="flex flex-col gap-4">
            {deleteError && (
              <div className="text-xs text-red-600">{deleteError}</div>
            )}
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeletingId(null)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  setDeleteLoading(true);
                  setDeleteError(null);
                  try {
                    const token = localStorage.getItem("token");
                    await axios.delete(API.SALES.CRUD + `/${deletingId}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    setDeletingId(null);
                    fetchOrders();
                  } catch (err: unknown) {
                    let errorMsg = "Delete failed. Try again.";
                    if (axios.isAxiosError(err)) {
                      errorMsg = err.response?.data?.message || errorMsg;
                    }
                    setDeleteError(errorMsg);
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Sales Entry Modal */}
        <Modal
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setEditingOrder(null);
          }}
          title={editingOrder ? "Edit Sales Entry" : "Create Sales Entry"}
          description="Fill in the details below to save your order."
        >
          {showForm ? (
            editingOrder ? (
              lookup.products.length &&
              lookup.transporters.length &&
              lookup.plantCodes.length &&
              lookup.salesZones.length &&
              lookup.packConfigs.length ? (
                <SalesEntryForm
                  key={`edit-${editingOrder.id}-${showForm}`}
                  initialData={editingOrder}
                  lookup={lookup}
                  onSuccess={() => {
                    setShowForm(false);
                    setEditingOrder(null);
                    fetchOrders();
                  }}
                />
              ) : (
                <div className="py-8 text-center text-lg text-muted-foreground">
                  Loading form...
                </div>
              )
            ) : // Create mode
            lookup.products.length &&
              lookup.transporters.length &&
              lookup.plantCodes.length &&
              lookup.salesZones.length &&
              lookup.packConfigs.length ? (
              <SalesEntryForm
                key={`create-${showForm}`}
                lookup={lookup}
                onSuccess={() => {
                  setShowForm(false);
                  setEditingOrder(null);
                  fetchOrders();
                }}
              />
            ) : (
              <div className="py-8 text-center text-lg text-muted-foreground">
                Loading form...
              </div>
            )
          ) : null}
        </Modal>
      </div>
    </AnimatedPage>
  );
}
