"use client";

import { useState } from "react";
import { motion } from "framer-motion";
// Removed Dayjs and MUI imports from here since they are moving to Statuscards.tsx

import StatusCards from "../admindashborad/Statuscards";
import OrderImportsCard from "../admindashborad/OrderImports";
import UpcomingOrders from '../admindashborad/UpcomingOrders';
import OrderStatusPieChart from "../admindashborad/OrderStatusPieChart";
import OrderStatusByZone from "../admindashborad/OrderzoneBarchart";
import PaymentClearanceChart from "../admindashborad/PaymentClearanceBarchart";
import OrderStatusByCustomerChart from '../admindashborad/OrderStatusByCustomerChart';
import PaymentClearanceByCustomerChart from '../admindashborad/PaymentClearanceByCustomerChart';
import OperatorStatsTable from "../admindashborad/OperatorStatsTable";
import { formatDateIST, getISTDateKey } from "@/common/utils/dateTime";

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>(
    getISTDateKey(new Date())
  );

  const displayDate = selectedDate 
    ? formatDateIST(selectedDate)
    : "All Time";

  return (
    <div className="py-2 md:py-2">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        
        {/* --- DATE FILTER REMOVED FROM HERE --- */}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Passed setSelectedDate down to StatusCards */}
          <StatusCards selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="h-full">
              <OrderImportsCard /> 
            </div>
            <div className="h-full">
              <UpcomingOrders /> 
            </div>
            <div className="h-full">
              <OrderStatusPieChart selectedDate={selectedDate} displayDate={displayDate} />
            </div>
          </div>

          <div className="w-full mt-6">
            <OrderStatusByZone selectedDate={selectedDate} displayDate={displayDate} />
          </div>
          <div className="w-full mt-6">
            <PaymentClearanceChart selectedDate={selectedDate} displayDate={displayDate} />
          </div>
          <div className="w-full mt-6">
            <OrderStatusByCustomerChart selectedDate={selectedDate} displayDate={displayDate} />
          </div>
          <div className="w-full mt-6">
            <PaymentClearanceByCustomerChart selectedDate={selectedDate} displayDate={displayDate} />
          </div>
          <div className="w-full mt-6">
            <OperatorStatsTable selectedDate={selectedDate} />
          </div>

        </motion.div>
      </div>
    </div>
  );
}