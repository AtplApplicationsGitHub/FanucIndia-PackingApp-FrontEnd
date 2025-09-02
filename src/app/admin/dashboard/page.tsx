"use client";

import * as React from "react";
import { Box, Typography, Paper, Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion";
import AdminDashboardHeader from "@/app/admin/components/dashboard/Header";
import AdminOrdersTable from "@/app/admin/components/dashboard/OrdersTable";
import AdminMasterLookupPanel from "@/app/admin/components/dashboard/LookupPanel";
import AdminManageUsersPanel from "@/app/admin/components/dashboard/UsersPanel";
import AdminOrdersToolbar from "@/app/admin/components/dashboard/OrdersToolbar";
import AdminOrderEditModal from "@/app/admin/components/dashboard/EditModal";
import ConfirmDeleteDialog from "@/common/components/ConfirmDeleteDialog";
import { useAdminDashboard } from "@/app/admin/components/hooks/useAdminDashboard";
import axios from "axios";
import { API } from "@/common/lib/api";
import { SalesOrder, EditableField } from "@/app/admin/components/types/admin";
import { useRouter } from "next/navigation";
import ErpUploadDialog from "@/app/admin/components/dashboard/ErpUploadDialog";
import DispatchView from "@/app/components/DispatchView";
import FgDashboardView from "@/app/components/FgDashboardView";

export default function AdminDashboard() {
  const [editOrder, setEditOrder] = React.useState<SalesOrder | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const [erpUploadOrder, setErpUploadOrder] = React.useState<SalesOrder | null>(null);
  const [isErpUploadOpen, setIsErpUploadOpen] = React.useState(false);

  const admin = useAdminDashboard();
  const router = useRouter();
  const {
    snackbar: adminSnackbar,
    onSnackbarClose: handleAdminSnackbarClose,
  } = admin;

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const onUpdateInline = async (
    id: number,
    field: EditableField,
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
      showSnackbar("Updated!", "success");
      admin.setCurrentPage(1);
      await admin.fetchOrders();
    } catch {
      showSnackbar("Update failed.", "error");
    }
  };

  const handleDetailedViewClick = async (order: SalesOrder) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API.ADMIN.ERP_MATERIALS_BY_ORDER(order.id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data && res.data.length > 0) {
        router.push(`/orders/${order.id}`);
      } else {
        setErpUploadOrder(order);
        setIsErpUploadOpen(true);
      }
    } catch (error) {
      showSnackbar('Could not check for material data. Please try again.', 'error');
      console.error("Failed to check ERP materials:", error);
    }
  };

  const handleUploadSuccess = () => {
    setIsErpUploadOpen(false);
    if (erpUploadOrder) {
      router.push(`/orders/${erpUploadOrder.id}`);
    }
  };

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Snackbar
        open={adminSnackbar.open}
        autoHideDuration={6000}
        onClose={handleAdminSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleAdminSnackbarClose}
          severity={adminSnackbar.severity}
          sx={{ width: "100%" }}
        >
          {adminSnackbar.message}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          bgcolor: "background.default",
          p: 0,
        }}
      >
        <AdminDashboardHeader
          userName={admin.userName}
          view={admin.view}
          setView={admin.setView}
        />

        {admin.view === "" && (
          <Box
            sx={{
              minHeight: "40vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: "bold",
              color: (theme) =>
                theme.palette.mode === "dark" ? "#90caf9" : "#1a237e",
            }}
          >
            Welcome
          </Box>
        )}

        {admin.view === "orders" && (
          <Box sx={{ py: 4, width: "100%" }}>
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginBottom: 32 }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 3,
                  px: { xs: 2, md: 4 },
                  mb: 1,
                }}
              >
                <AdminOrdersToolbar
                  searchInput={admin.searchInput}
                  onSearchInputChange={(val) => {
                    admin.setSearchInput(val);
                    admin.setSearchProduct(val);
                    admin.setCurrentPage(1);
                  }}
                  startDate={admin.startDate}
                  onStartDateChange={(date: Date | null) => {
                    admin.setStartDate(date);
                    admin.setCurrentPage(1);
                  }}
                  endDate={admin.endDate}
                  onEndDateChange={(date: Date | null) => {
                    admin.setEndDate(date);
                    admin.setCurrentPage(1);
                  }}
                  onClear={() => {
                    admin.handleClearFilters();
                  }}
                />
              </Box>
            </motion.div>
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                mb: 2,
                px: { xs: 1, md: 2 },
                py: 1,
                bgcolor: "background.paper",
              }}
            >
              <AdminOrdersTable
                orders={admin.orders}
                lookup={admin.lookup}
                currentPage={admin.currentPage}
                pageSize={admin.pageSize}
                rowCount={admin.totalOrders}
                setCurrentPage={admin.setCurrentPage}
                setPageSize={admin.setPageSize}
                onDelete={(id: number) =>
                  admin.setConfirmDelete({ type: "orders", id })
                }
                onUpdateInline={onUpdateInline}
                onEdit={(order: SalesOrder) => {
                  setEditOrder(order);
                  setEditModalOpen(true);
                }}
                onDetailedView={handleDetailedViewClick}
                loading={admin.loading}
              />
            </Paper>
          </Box>
        )}

        {admin.view === "master" && <AdminMasterLookupPanel />}

        {admin.view === "manage" && (
          <AdminManageUsersPanel showSnackbar={showSnackbar} />
        )}

        {admin.view === "dispatch" && <DispatchView />}

        {admin.view === "fg_dashboard" && <FgDashboardView />}

        {admin.error && (
          <Box
            sx={{
              minHeight: "40vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: "error.main",
            }}
          >
            {admin.error}
          </Box>
        )}

        <ConfirmDeleteDialog
          open={!!admin.confirmDelete}
          onCancel={() => admin.setConfirmDelete(null)}
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
          loading={admin.deleteLoading}
          title="Delete Confirmation"
          description={
            <>
              Are you sure you want to delete this item? This action cannot be
              undone.
              {admin.deleteError && (
                <Typography
                  variant="caption"
                  color="error"
                  display="block"
                  mt={2}
                >
                  {admin.deleteError}
                </Typography>
              )}
            </>
          }
        />

        {editOrder && (
          <AdminOrderEditModal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setEditOrder(null);
            }}
            order={editOrder}
            lookup={admin.lookup}
            onUpdate={(updatedOrder: SalesOrder) => {
              setEditModalOpen(false);
              setEditOrder(null);
              admin.setOrders?.((prev: SalesOrder[]) =>
                prev.map((o: SalesOrder) =>
                  o.id === updatedOrder.id ? updatedOrder : o
                )
              );
            }}
          />
        )}
        
        <ErpUploadDialog
          open={isErpUploadOpen}
          onClose={() => setIsErpUploadOpen(false)}
          onUploadSuccess={handleUploadSuccess}
          saleOrderNumber={erpUploadOrder?.saleOrderNumber ?? null}
        />
      </Box>
    </>
  );
}
