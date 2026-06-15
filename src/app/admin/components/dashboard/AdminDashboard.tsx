"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import StatusCards from "../admindashborad/Statuscards";
import OrderImportsCard from "../admindashborad/OrderImports";
import UpcomingOrders from "../admindashborad/UpcomingOrders";
import OrderStatusPieChart from "../admindashborad/OrderStatusPieChart";
import OrderStatusByZone from "../admindashborad/OrderzoneBarchart";
import PaymentClearanceChart from "../admindashborad/PaymentClearanceBarchart";
import OrderStatusByCustomerChart from "../admindashborad/OrderStatusByCustomerChart";
import PaymentClearanceByCustomerChart from "../admindashborad/PaymentClearanceByCustomerChart";
import OperatorStatsTable from "../admindashborad/OperatorStatsTable";
import { formatDateIST, getISTDateKey } from "@/common/utils/dateTime";

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>(
    getISTDateKey(new Date()),
  );

  const displayDate = selectedDate ? formatDateIST(selectedDate) : "All Time";

  return (
    <div className="pb-z">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatusCards
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          {/* Row 3: Order Status by Customer */}
          <div className="w-full mt-4">
            <OrderStatusByCustomerChart
              selectedDate={selectedDate}
              displayDate={displayDate}
            />
          </div>

          {/* Row 4: Order Status by Sales Zone */}
          <div className="w-full mt-4">
            <OrderStatusByZone
              selectedDate={selectedDate}
              displayDate={displayDate}
            />
          </div>

          {/* Row 5: Payment Clearance by Customer */}
          <div className="w-full mt-4">
            <PaymentClearanceByCustomerChart
              selectedDate={selectedDate}
              displayDate={displayDate}
            />
          </div>
          {/* Row 6: Orders Created / Upcoming Orders / Overall Order Status Count */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="h-full">
              <OrderImportsCard />
            </div>
            <div className="h-full">
              <UpcomingOrders />
            </div>
            <div className="h-full">
              <OrderStatusPieChart
                selectedDate={selectedDate}
                displayDate={displayDate}
              />
            </div>
          </div>

          {/* Row 7: Payment Clearance by Sales Zone */}
          {/* <div className="w-full mt-4">
            <PaymentClearanceChart
              selectedDate={selectedDate}
              displayDate={displayDate}
            />
          </div> */}

          {/* Row 8: Operator Productivity */}
          <div className="w-full mt-4">
            <OperatorStatsTable selectedDate={selectedDate} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
