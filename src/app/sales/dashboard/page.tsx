"use client";
import React from "react";
import AnimatedPage from "@/components/common/AnimatedPage";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/Modal";
import SalesDashboardHeader from "@/components/dashboard/sales/SalesDashboardHeader";
import SalesDashboardToolbar from "@/components/dashboard/sales/SalesDashboardToolbar";
import SalesOrdersTable from "@/components/dashboard/sales/SalesOrdersTable";
import SalesEntryForm from "@/components/forms/SalesEntry/SalesEntryForm";
import TablePagination from "@/components/common/TablePagination";
import { useSalesDashboard } from "@/hooks/useSalesDashboard";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";

export default function SalesDashboard() {
  const {
    pagedOrders,
    lookup,
    error,
    userName,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    setCurrentPage,
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
  } = useSalesDashboard();

  if (error)
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-lg text-red-600">
        {error}
      </div>
    );

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-background p-0 w-full">
        <SalesDashboardHeader userName={userName} />
        <div className="py-8 w-full grid grid-cols-12 gap-0">
          <div className="col-span-12">
            <SalesDashboardToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              onCreate={handleCreate}
              onDownload={handleDownloadTemplate}
              onBulkUpload={handleBulkUpload}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
            />

            {pagedOrders.length === 0 ? (
              <Card className="flex items-center justify-center h-[40vh] w-full shadow-lg rounded-2xl text-2xl font-semibold text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900">
                No orders found.
              </Card>
            ) : (
              <SalesOrdersTable
                orders={pagedOrders}
                lookup={lookup}
                currentPage={currentPage}
                pageSize={10}
                onEdit={handleEdit}
                onDelete={setDeletingId}
              />
            )}

            <div className="flex justify-between items-center mt-4 px-2">
              <span className="text-sm text-gray-700">
                Showing {(currentPage - 1) * 10 + 1} to{" "}
                {Math.min(currentPage * 10, pagedOrders.length)} of{" "}
                {pagedOrders.length} orders
              </span>
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>

        {/* Delete Modal */}
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
                <div className="text-xs text-red-600 mt-2">{deleteError}</div>
              )}
            </>
          }
        />

        {/* Entry Form Modal */}
        <Modal
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) handleModalClose();
          }}
          title={editingOrder ? "Edit Sales Entry" : "Create Sales Entry"}
          description="..."
        >
          {showForm && (
            <SalesEntryForm
              key={editingOrder ? `edit-${editingOrder.id}` : "create"}
              initialData={editingOrder || undefined}
              lookup={lookup}
              onSuccess={() => {
                setShowForm(false);
                handleModalClose();
                fetchOrders();
              }}
            />
          )}
        </Modal>
      </div>
    </AnimatedPage>
  );
}
