"use client";

import React from "react";
import { motion } from "framer-motion";
import StatsCards from "./salesdashboard/StatsCards";
import RecentActivity from "./salesdashboard/RecentActivity";
import OrderStatusChart from "./salesdashboard/OrderStatus";
import ViewOrderDetails from "./salesdashboard/ViewOrder";
import PaymentMethodsChart from "./salesdashboard/PaymentMethodsChart";

export default function SalesDashboard() {
  return (
    <div className="py-6 md:py-8">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Stats Cards */}
          <StatsCards />

          {/* 3-Column Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="h-full ">
              <OrderStatusChart />
            </div>
            <div className="h-full">
              <PaymentMethodsChart />
            </div>
            <div className="h-full">
              <ViewOrderDetails />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <RecentActivity />
          </div>
        </motion.div>
      </div>
    </div>
  );
}