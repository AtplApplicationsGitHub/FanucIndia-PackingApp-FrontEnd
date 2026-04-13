"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import UserDashboardMain from "@/app/user/components/UserdashboradMain";
import SoChatDrawer from "@/app/components/SoChatDrawer";
import { useTheme } from "@mui/material";


function UserDashboardContent() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const {
    view,
    setView,
    orders,
    loading,
    error,
    alert,
    setAlert,
    userName,
    fetchOrders,
  } = useUserDashboard();

  const [erpUploadOrder, setErpUploadOrder] = React.useState<SalesOrder | null>(null);
  const [isErpUploadOpen, setIsErpUploadOpen] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatSoNumber, setChatSoNumber] = React.useState<string | null>(null);
  const [chatOrderId, setChatOrderId] = React.useState<number | null>(null);

  const router = useRouter();

  React.useEffect(() => {
    const urlView = searchParams.get("view") as any;
    if (urlView) {
      if (urlView !== view) {
        setView(urlView);
        sessionStorage.setItem("userDashboardView", urlView);
      }
    } else {
      if (view !== "home") {
        setView("home");
        sessionStorage.setItem("userDashboardView", "home");
      }
    }
  }, [searchParams]);

  // NEW: Custom function to update the tab AND the browser history URL
  const handleViewChange = (newView: any) => {
    setView(newView);
    sessionStorage.setItem("userDashboardView", newView);
    router.push(`/user/dashboard?view=${newView}`);
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

  const handleUploadSuccess = async () => {
    setIsErpUploadOpen(false);
    showSnackbar("ERP Data uploaded successfully!", "success");
    await fetchOrders();
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
          userName={userName}
          view={view}
          setView={handleViewChange}
          showBackButton={view !== "home"}
        />

        {view === "home" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ padding: "1rem" }}
          >
            <UserDashboardMain userName={userName} setView={setView} />
          </motion.div>
        )}

        {view === "pick_pack" && (
          <Box sx={{ py: 4, px: 0, width: "100%" }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ padding: "1rem" }}

            >
              <Paper
                elevation={0}
                sx={{
                  width: "100%",
                  mb: 2,
                  px: 0,
                  py: 0,
                  bgcolor: "background.paper",
                  borderRadius: 0,
                }}
              >
                <AssignedOrdersTable
                  orders={orders}
                  loading={loading}
                  onDetailedView={handleDetailedViewClick}
                  onOpenChat={handleOpenChat}
                />
              </Paper>
            </motion.div>
          </Box>
        )}

        {view === "dispatch" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ padding: "1rem" }}
          >
            <DispatchView />
          </motion.div>
        )}

        {view === "fg_dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ padding: "1rem" }}
          >
            <FgDashboardView />
          </motion.div>
        )}

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

      <SoChatDrawer
        open={chatOpen}
        onClose={handleChatClose}
        orderId={chatOrderId}
        soNumber={chatSoNumber}
        buttonSx={{
          bgcolor: theme.palette.primary.main,
          color: "#fff",
          "&:hover": {
            bgcolor: theme.palette.primary.dark,
          },
        }}
      />
    </>
  );
}

export default function UserDashboard() {
  return (
    <Suspense fallback={<Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">Loading...</Box>}>
      <UserDashboardContent />
    </Suspense>
  );
}