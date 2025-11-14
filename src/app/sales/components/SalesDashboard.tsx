// app/sales/salesdashboard/page.tsx
"use client";

import React from "react";
import { Box, Container, Grid } from "@mui/material";
import { motion } from "framer-motion";
import StatsCards from "./salesdashboard/StatsCards";
import RecentActivity from "./salesdashboard/RecentActivity";
import OrderStatusChart from "./salesdashboard/OrderStatus";
import ViewOrderDetails from "./salesdashboard/ViewOrder";
import PaymentMethodsChart from "./salesdashboard/PaymentMethodsChart";

export default function SalesDashboard() {
  return (
    <Box py={{ xs: 3, md: 4 }}>
      <Container
        maxWidth={false}
        disableGutters
        sx={{ px: { xs: 3, md: 6 }, pb: 6 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* ---------- Top Stats Cards ---------- */}
          <StatsCards />

          {/* ---------- Charts Row (Order Status / Payment Status  / ViewOrdetails)  ---------- */}
          <Grid container spacing={2} mt={3} alignItems="stretch">
            {/* Left: Order Status Chart */}
            <Grid>
              <OrderStatusChart />
            </Grid>

            <Grid>
              <PaymentMethodsChart />
            </Grid>

            <Grid>
              <ViewOrderDetails />
            </Grid>
          </Grid>

          <Box mt={4}>
            <RecentActivity />
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
