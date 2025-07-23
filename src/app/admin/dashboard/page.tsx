"use client";

import AnimatedPage from "@/components/common/AnimatedPage";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TablePagination from "@/components/common/TablePagination";
import AdminDashboardHeader from "@/components/dashboard/admin/AdminDashboardHeader";
import AdminOrdersTable from "@/components/dashboard/admin/AdminOrdersTable";
import AdminMasterLookupPanel from "@/components/dashboard/admin/AdminMasterLookupPanel";
import AdminManageUsersPanel from "@/components/dashboard/admin/AdminManageUsersPanel";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { API } from "@/lib/api";

export default function AdminDashboard() {
  const admin = useAdminDashboard();

  // Used for showing "Showing X to Y of Z" for Orders Table
  const from = (admin.currentPage - 1) * admin.pageSize + 1;
  const to = Math.min(admin.currentPage * admin.pageSize, admin.totalOrders);

  // Inline update for Status, Priority, Terminal
  const onUpdateInline = async (
    id: number,
    field: "status" | "priority" | "terminalId",
    value: string | number | null
  ) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        API.ADMIN.SALES_ORDER_BY_ID(id),
        { [field]: value },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Updated!");
      admin.setCurrentPage(1); // or refresh as per your need
    } catch {
      toast.error("Update failed.");
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-background p-0 w-full">
        <AdminDashboardHeader
          userName={admin.userName}
          view={admin.view}
          setView={admin.setView}
        />

        {/* Initial Welcome */}
        {admin.view === "" && (
          <div className="min-h-[40vh] flex items-center justify-center text-2xl font-bold text-blue-800 dark:text-blue-300">
            Welcome
          </div>
        )}

        {/* ----- ORDERS TABLE ----- */}
        {admin.view === "orders" && (
          <div className="py-8 w-full grid grid-cols-12 gap-0">
            <div className="col-span-12">
              {/* Search, filters, etc */}
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
                    placeholder="Search"
                    className="border border-gray-200 dark:border-zinc-700 rounded-none px-3 py-2 bg-white dark:bg-zinc-900 text-[15px] w-full md:w-auto"
                    value={admin.searchInput}
                    onChange={(e) => {
                      admin.setSearchInput(e.target.value);
                      admin.setSearchProduct(e.target.value);
                      admin.setCurrentPage(1);
                    }}
                  />
                  <div className="relative w-full md:w-auto">
                    <Popover
                      open={admin.openCalendar}
                      onOpenChange={admin.setOpenCalendar}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`
                            w-full md:w-auto justify-start text-left
                            font-normal bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white
                            border border-gray-200 dark:border-zinc-700
                            px-3 py-2
                            ${admin.searchDate ? "" : "text-muted-foreground"}
                            rounded-none
                          `}
                          aria-label="Select date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {admin.searchDate ? (
                            format(admin.searchDate, "dd-MM-yyyy")
                          ) : (
                            <span>Filter by Date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 bg-white dark:bg-zinc-900 rounded-none w-auto">
                        <Calendar
                          mode="single"
                          selected={admin.searchDate}
                          onSelect={(date) => {
                            admin.setSearchDate(date);
                            admin.setCurrentPage(1);
                            admin.setOpenCalendar(false);
                          }}
                          className="bg-white dark:bg-zinc-900 text-black dark:text-white"
                          initialFocus
                        />
                        {admin.searchDate && (
                          <div className="flex justify-end p-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-none"
                              onClick={() => admin.setSearchDate(undefined)}
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
                      admin.setSearchInput("");
                      admin.setSearchProduct("");
                      admin.setSearchDate(undefined);
                      admin.setCurrentPage(1);
                    }}
                    className="ml-1 px-5 py-2 rounded-none"
                  >
                    CLEAR
                  </Button>
                </div>
              </motion.div>
              {/* --- NEW DataTable-based AdminOrdersTable --- */}
              <AdminOrdersTable
                orders={admin.orders}
                lookup={admin.lookup}
                currentPage={admin.currentPage}
                pageSize={admin.pageSize}
                onDelete={(id) =>
                  admin.setConfirmDelete({ type: "orders", id })
                }
                onUpdateInline={onUpdateInline}
                loading={admin.loading}
              />

              {/* Pagination & Info Bar */}
              {admin.totalOrders > 0 && (
                <div className="flex justify-between items-center mt-4 px-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {from} to {to} of {admin.totalOrders} orders
                  </span>
                  <TablePagination
                    currentPage={admin.currentPage}
                    totalPages={Math.max(
                      1,
                      Math.ceil(admin.totalOrders / admin.pageSize)
                    )}
                    onPageChange={admin.setCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----- MASTER LOOKUP PANEL ----- */}
        {admin.view === "master" && (
          <AdminMasterLookupPanel
          />
        )}

        {admin.view === "manage" && <AdminManageUsersPanel />}

        {/* GLOBAL ERROR (fallback) */}
        {admin.error && (
          <div className="min-h-[40vh] flex items-center justify-center text-lg text-red-600">
            {admin.error}
          </div>
        )}

        {/* GLOBAL DELETE DIALOG (for lookup masters and orders) */}
        <ConfirmDeleteDialog
          open={!!admin.confirmDelete}
          onClose={() => admin.setConfirmDelete(null)}
          onConfirm={async () => {
            if (!admin.confirmDelete) return;
            if (admin.confirmDelete.type === "orders") {
              await admin.onOrderDelete(admin.confirmDelete.id);
            } else {
              await admin.onMasterRequestDelete(
                admin.confirmDelete.type,
                admin.confirmDelete.id
              );
            }
            admin.setConfirmDelete(null);
          }}
        />
      </div>
    </AnimatedPage>
  );
}

// ----------- ConfirmDeleteDialog component -------------
function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this item? This action cannot be
          undone.
        </DialogDescription>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="destructive" onClick={onConfirm}>
            Yes, Delete
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
