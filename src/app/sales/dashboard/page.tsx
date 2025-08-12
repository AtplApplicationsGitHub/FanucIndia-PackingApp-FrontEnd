"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MUICard from "@mui/material/Card";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import SalesDashboardHeader from "@/app/sales/components/Header";
import SalesDashboardToolbar from "@/app/sales/components/Toolbar";
import SalesOrdersTable from "@/app/sales/components/Table";
import ConfirmDeleteDialog from "@/common/components/ConfirmDeleteDialog";
import AnimatedPage from "@/common/components/AnimatedPage";
import { useSalesDashboard } from "@/app/sales/components/hooks/useSalesDashboard";
import SalesEntryDialog from "@/app/sales/components/forms/SalesEntryDialog";

export default function SalesDashboard() {
  const {
    orders,
    lookup,
    error,
    userName,
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

  if (error)
    return (
      <Box
        minHeight="40vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography color="error" fontSize="1.25rem">
          {error}
        </Typography>
      </Box>
    );

  return (
    <AnimatedPage>
      <Box minHeight="100vh" bgcolor="background.default" width="100%">
        <Snackbar
          open={!!alert}
          autoHideDuration={2000}
          onClose={() => setAlert(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          {alert ? (
            <Alert
              onClose={() => setAlert(null)}
              severity={alert.severity}
              sx={{ width: "100%" }}
            >
              {alert.message}
            </Alert>
          ) : undefined}
        </Snackbar>

        <SalesDashboardHeader userName={userName} />

        <Box py={4} width="100%">
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
            <MUICard
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "40vh",
                width: "100%",
                boxShadow: 6,
                borderRadius: 4,
                fontSize: "2rem",
                fontWeight: 600,
                color: "text.secondary",
                bgcolor: "background.paper",
              }}
            >
              No orders found.
            </MUICard>
          ) : (
            <SalesOrdersTable
              orders={orders}
              lookup={lookup}
              totalOrders={totalOrders}
              onEdit={handleEdit}
              onDelete={setDeletingId}
              paginationModel={{ page: currentPage - 1, pageSize }}
              onPaginationModelChange={({ page, pageSize }) => {
                setCurrentPage(page + 1); // MUI uses 0-based index
                setPageSize(pageSize);
                fetchOrders(page + 1, pageSize);
              }}
            />
          )}
        </Box>

        <ConfirmDeleteDialog
          open={deletingId !== null}
          onCancel={handleDeleteModalClose}
          onConfirm={handleDelete}
          loading={deleteLoading}
          title="Delete Confirmation"
          description={
            <>
              Are you sure you want to delete this item? This action cannot be
              undone.
              {deleteError && (
                <Typography
                  variant="caption"
                  color="error"
                  display="block"
                  mt={2}
                >
                  {deleteError}
                </Typography>
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
      </Box>
    </AnimatedPage>
  );
}
