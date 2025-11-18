"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion";
import UserDashboardHeader from "@/app/user/components/Header";
import AssignedOrdersTable from "@/app/user/components/OrdersTable";
import { useUserDashboard } from "@/app/user/hooks/useUserDashboard";
import DispatchView from "@/app/components/DispatchView";
import FgDashboardView from "@/app/components/FgDashboardView";
import axios from "axios";
import { API } from '@/common/lib/endpoints';
import { SalesOrder } from "@/app/admin/components/types/admin";
import ErpUploadDialog from "@/app/admin/components/dashboard/ErpUploadDialog";

export default function UserDashboard() {
  const {
    view,
    setView,
    orders,
    loading,
    error,
    alert,
    setAlert,
  } = useUserDashboard();

  const [erpUploadOrder, setErpUploadOrder] = React.useState<SalesOrder | null>(null);
  const [isErpUploadOpen, setIsErpUploadOpen] = React.useState(false);
  
  // 👇 FIX #2: Use the correct hook to get the router instance
  const router = useRouter(); 

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setAlert({ message, severity });
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

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setAlert(null);
  };

  return (
    <>
      <Snackbar
        open={!!alert}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={alert?.severity || 'info'}
          sx={{ width: "100%" }}
        >
          {alert?.message}
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
        <UserDashboardHeader
          view={view}
          setView={setView}
        />

        {view === "home" && (
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

        {view === "pick_pack" && (
          <Box sx={{ py: 4, px: { xs: 2, md: 4 }, width: "100%" }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
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
                <AssignedOrdersTable
                  orders={orders}
                  loading={loading}
                  onDetailedView={handleDetailedViewClick}
                />
              </Paper>
            </motion.div>
          </Box>
        )}

        {view === "dispatch" && <DispatchView />}

        {view === "fg_dashboard" && <FgDashboardView />}

        {error && (
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
            {error}
          </Box>
        )}
      </Box>

      <ErpUploadDialog
        open={isErpUploadOpen}
        onClose={() => setIsErpUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        saleOrderNumber={erpUploadOrder?.saleOrderNumber ?? null}
      />
    </>
  );
}