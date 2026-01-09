// src/app/sales/dashboard/page.tsx
"use client";

import React from "react";
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

export default function SalesDashboard() {
  const theme = useTheme();
  const {
    orders,
    lookup,
    error,
    userName, 
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
    handleBulkUpload,
    fileInputRef,
    handleFileChange,
    handleModalClose,
    fetchOrders,
    alert,
    setAlert,
  } = useSalesDashboard();

  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatSoNumber, setChatSoNumber] = React.useState<string | null>(null);

  const handleOpenChat = (soNumber: string, _orderId: number) => {
    setChatSoNumber(soNumber);
    setChatOpen(true);
  };

  const handleChatClose = () => {
    setChatOpen(false);
    setChatSoNumber(null);
  };

  if (error && !orders.length) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
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

        <SalesDashboardHeader userName={userName} view={view} setView={setView} />

        {/* HOME VIEW - Beautiful Dashboard */}
        {view === "home" && <HomeDashboard />}

        {/* ORDERS VIEW */}
        {view === "orders" && (
          <Box p={{ xs: 2, md: 4 }}>
            <SalesDashboardToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              onCreate={handleCreate}
              onDownload={handleDownloadTemplate}
              onBulkUpload={handleBulkUpload}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
            />

            {orders.length === 0 ? (
              <Box display="flex" justifyContent="center" mt={8}>
                <Alert severity="info">No orders found. Create your first order!</Alert>
              </Box>
            ) : (
              <SalesOrdersTable
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
              />
            )}
          </Box>
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
              Are you sure you want to delete this order? This action cannot be undone.
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
          initialData={editingOrder || undefined}
          lookup={lookup}
          onSuccess={() => {
            setShowForm(false);
            handleModalClose();
            fetchOrders();
          }}
        />

        <SoChatDrawer
          open={chatOpen}
          onClose={handleChatClose}
          soNumber={chatSoNumber}
          buttonSx={{
            bgcolor: theme.palette.primary.main,
            color: "#fff",
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        />
      </Box>
    </>
  );
}