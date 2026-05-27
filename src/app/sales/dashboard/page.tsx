"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import SoChatDrawer from "@/app/components/SoChatDrawer";
import { useTheme } from "@mui/material";
import SalesDashboardHeader from "@/app/sales/components/Header";
import SalesDashboardToolbar from "@/app/sales/components/Toolbar";
import SalesOrdersTable from "@/app/sales/components/Table";
import HomeDashboard from "@/app/sales/components/SalesDashboard";
import ConfirmDeleteDialog from "@/common/components/ConfirmDeleteDialog";
import { useSalesDashboard } from "@/app/sales/components/hooks/useSalesDashboard";
import SalesEntryDialog from "@/app/sales/components/forms/SalesEntryDialog";
import axios from "axios";
import { API } from "@/common/lib/endpoints";
import AttachmentUploadDialog from "@/app/sales/components/AttachmentUploadDialog";
import { motion } from "framer-motion";

function SalesDashboardContent() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    orders,
    lookup,
    error,
    userName,
    salesZone,
    view,
    setView,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalOrders,
    showForm,
    editingOrder,
    handleEdit,
    handleCreate,
    setShowForm,
    deletingId,
    setDeletingId,
    deleteLoading,
    deleteError,
    handleDelete,
    handleDeleteModalClose,
    handleDownloadTemplate,
    handleDownloadBlankTemplate,
    handleBulkUpload,
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
    selectedIds,
    setSelectedIds,
    handleUploadAttachment,
    attachmentFileInputRef,
    handleAttachmentFileChange,
    handleDownloadDispatchedExcel,
  } = useSalesDashboard();

  const defaultZoneId = lookup.salesZones.find(
    (z) => z.name.toLowerCase() === (salesZone || "").toLowerCase(),
  )?.id;

  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatSoNumber, setChatSoNumber] = React.useState<string | null>(null);
  const [chatOrderId, setChatOrderId] = React.useState<number | null>(null);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);

  React.useEffect(() => {
    const urlView = searchParams.get("view") as any;
    if (urlView) {
      if (urlView !== view) {
        setView(urlView);
        sessionStorage.setItem("salesDashboardView", urlView);
      }
    } else {
      if (view !== "home") {
        setView("home");
        sessionStorage.setItem("salesDashboardView", "home");
      }
    }
  }, [searchParams]);

  // NEW: Custom function to update the tab AND the browser history URL
  const handleViewChange = (newView: any) => {
    setView(newView);
    sessionStorage.setItem("salesDashboardView", newView);
    router.push(`/sales/dashboard?view=${newView}`);
  };

  const handleOpenChat = async (soNumber: string, orderId: number) => {
    setChatSoNumber(soNumber);
    setChatOrderId(orderId);
    setChatOpen(true);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(API.SO_NOTIFICATIONS.CLEAR_SO(orderId), {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  const handleChatClose = () => {
    setChatOpen(false);
    setChatSoNumber(null);
    setChatOrderId(null);
  };

  if (error && !orders.length) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <>
      <Box minHeight="100vh" bgcolor="background.default">
        <Snackbar
          open={!!alert}
          autoHideDuration={3000}
          onClose={() => setAlert(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          {alert ? (
            <Alert onClose={() => setAlert(null)} severity={alert.severity}>
              {alert.message}
            </Alert>
          ) : undefined}
        </Snackbar>

        <SalesDashboardHeader
          userName={userName}
          salesZone={salesZone}
          view={view}
          setView={handleViewChange}
          showBackButton={view !== "home"}
        />

        {/* HOME VIEW - Dashboard */}
        {view === "home" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ padding: "1rem" }}
          >
            <HomeDashboard />
          </motion.div>
        )}

        {(view === "orders" || view === "dispatched") && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ padding: "1rem" }}
          >
            <Box px={{ xs: 1.5, md: 2 }} py={1}>
              <SalesDashboardToolbar
                view={view}
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                onCreate={handleCreate}
                onDownload={handleDownloadTemplate}
                onDownloadBlank={handleDownloadBlankTemplate}
                onDownloadDispatchedExcel={handleDownloadDispatchedExcel}
                onBulkUpload={handleBulkUpload}
                onUploadAttachment={() => {
                  if (selectedIds.length === 0) {
                    setAlert({
                      severity: "error",
                      message:
                        "Please select at least one order before uploading attachments.",
                    });
                    return;
                  }
                  setAttachmentDialogOpen(true);
                }}
                onClear={handleClearFilters}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
                paymentFilter={paymentFilter}
                onPaymentFilterChange={setPaymentFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                selectedIds={selectedIds}
              />

              <SalesOrdersTable
                view={view}
                orders={orders}
                lookup={lookup}
                totalOrders={totalOrders}
                onEdit={handleEdit}
                onOpenChat={handleOpenChat}
                onDelete={setDeletingId}
                paginationModel={{ page: currentPage - 1, pageSize }}
                onPaginationModelChange={({ page, pageSize }) => {
                  setCurrentPage(page + 1);
                  setPageSize(pageSize);
                  fetchOrders(page + 1, pageSize);
                }}
                selectedIds={selectedIds}
                onSelectedIdsChange={setSelectedIds}
              />
            </Box>
          </motion.div>
        )}

        {/* Dialogs */}
        <ConfirmDeleteDialog
          open={deletingId !== null}
          onCancel={handleDeleteModalClose}
          onConfirm={handleDelete}
          loading={deleteLoading}
          title="Delete Order"
          description={
            <>
              Are you sure you want to delete this order? This action cannot be
              undone.
              {deleteError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {deleteError}
                </Alert>
              )}
            </>
          }
        />

        <SalesEntryDialog
          open={showForm}
          onClose={() => {
            setShowForm(false);
            handleModalClose();
          }}
          initialData={
            editingOrder ||
            (defaultZoneId
              ? ({ salesZoneId: defaultZoneId } as any)
              : undefined)
          }
          lookup={{
            ...lookup,
            salesZones: defaultZoneId
              ? lookup.salesZones.filter((zone) => zone.id === defaultZoneId)
              : lookup.salesZones,
          }}
          onSuccess={() => {
            setShowForm(false);
            handleModalClose();
            fetchOrders();
          }}
        />

        <SoChatDrawer
          open={chatOpen}
          onClose={handleChatClose}
          orderId={chatOrderId}
          soNumber={chatSoNumber}
        />
        <AttachmentUploadDialog
          open={attachmentDialogOpen}
          onClose={() => setAttachmentDialogOpen(false)}
          // Change onUpload prop to async:
          onUpload={async (files) => {
            await handleAttachmentFileChange(files);
          }}
        />
      </Box>
    </>
  );
}

export default function SalesDashboard() {
  return (
    <Suspense
      fallback={
        <Box
          minHeight="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          Loading...
        </Box>
      }
    >
      <SalesDashboardContent />
    </Suspense>
  );
}
