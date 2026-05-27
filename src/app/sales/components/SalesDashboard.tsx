"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import StatsCards from "./salesdashboard/StatsCards";
import SalesOrderImports from "./salesdashboard/SalesOrderImports";
import SalesUpcomingOrders from "./salesdashboard/SalesUpcomingOrders";
import OrderStatus from "./salesdashboard/OrderStatus";
import PaymentMethodsChart from "./salesdashboard/PaymentMethodsChart";
import SalesOrderStatusByCustomerChart from "./salesdashboard/SalesOrderStatusByCustomerChart";
import RecentActivity from "./salesdashboard/RecentActivity";
import { formatDateIST, getISTDateKey } from "@/common/utils/dateTime";

export default function SalesDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>(
    getISTDateKey(new Date())
  );

  const displayDate = selectedDate
    ? formatDateIST(selectedDate)
    : "All Time";

  return (
    <div className="py-2 md:py-2">
      <div className="max-w-480 mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Row 1: KPI Cards */}
          <StatsCards selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

          {/* Row 2: Imports, Upcoming, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="h-full">
              <SalesOrderImports /> 
            </div>
            <div className="h-full">
              <SalesUpcomingOrders /> 
            </div>
            <div className="h-full">
              <OrderStatus selectedDate={selectedDate} displayDate={displayDate} />
            </div>
          </div>

          {/* Row 3: Payment Clearance */}
          <div className="w-full mt-6">
            <PaymentMethodsChart selectedDate={selectedDate} displayDate={displayDate} />
          </div>

          {/* Row 4: Order Status By Customer */}
          <div className="w-full mt-6">
            <SalesOrderStatusByCustomerChart selectedDate={selectedDate} displayDate={displayDate} />
          </div>

          {/* Row 5: Recent Activity */}
          <div className="w-full mt-8">
            <RecentActivity />
          </div>

        </motion.div>
      </div>
    </div>
  );
}