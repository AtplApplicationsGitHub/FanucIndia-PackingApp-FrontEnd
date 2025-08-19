"use client";

import * as React from "react";
import { Box, Paper, Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion";
import AnimatedPage from "@/common/components/AnimatedPage";
import UserDashboardHeader from "@/app/user/components/Header";
import AssignedOrdersTable from "@/app/user/components/OrdersTable";
import { useUserDashboard } from "@/app/user/hooks/useUserDashboard";

export default function UserDashboard() {
  const {
    userName,
    view,
    setView,
    orders,
    loading,
    error,
    alert,
    setAlert,
  } = useUserDashboard();

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setAlert(null);
  };

  return (
    <AnimatedPage>
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
                />
              </Paper>
            </motion.div>
          </Box>
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
    </AnimatedPage>
  );
}
