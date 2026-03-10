import React from "react";
import { motion } from "framer-motion";
import StatusCards from "../admindashborad/Statuscards";
import OrderImportsCard from "../admindashborad/OrderImports";
import DispatchSummary from "../admindashborad/DispatchSummary";
import OrderStatusPieChart from "../admindashborad/OrderStatusPieChart";
import OrderStatusByZone from "../admindashborad/OrderzoneBarchart";
import PaymentClearanceChart from "../admindashborad/PaymentClearanceBarchart";
import OrdersByCustomer from "../admindashborad/OrdersbyCustomer";
import OrdersByProduct from "../admindashborad/OrdersByProduct";

export default function AdminDashboard() {
  return (
    <div className="py-2 md:py-2">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatusCards />

          {/* 3-Column Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="h-full ">
              <OrderImportsCard />
            </div>
            <div className="h-full">
              <DispatchSummary />
            </div>
            <div className="h-full">
              <OrderStatusPieChart />
            </div>
          </div>

          {/* Full width OrderStatusByZone */}
          <div className="w-full mt-6">
            <OrderStatusByZone />
          </div>
          {/* Full Width  PaymentClearce */}
          <div className="w-full mt-6">
            <PaymentClearanceChart />
          </div>
          {/* 2 same column Responsiv  */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="h-full w-full ">
              <OrdersByCustomer />
            </div>
            <div className="h-full w-full">
              <OrdersByProduct />
            </div>
          </div> */}
        </motion.div>
      </div>
    </div>
  );
}
