"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import Box from "@mui/material/Box";

import StatusCards from "../admindashborad/Statuscards";
import OrderImportsCard from "../admindashborad/OrderImports";
import UpcomingOrders from '../admindashborad/UpcomingOrders';
import OrderStatusPieChart from "../admindashborad/OrderStatusPieChart";
import OrderStatusByZone from "../admindashborad/OrderzoneBarchart";
import PaymentClearanceChart from "../admindashborad/PaymentClearanceBarchart";
import OrderStatusByCustomerChart from '../admindashborad/OrderStatusByCustomerChart';
import PaymentClearanceByCustomerChart from '../admindashborad/PaymentClearanceByCustomerChart';

export default function AdminDashboard() {
  // Default to current date in YYYY-MM-DD format
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Format the date for the headers (e.g., "22 Mar 2026"). 
  // If cleared, display "(All Time)"
  const displayDate = selectedDate 
    ? new Date(selectedDate).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "All Time";

  // Convert the string to a Dayjs object for the MUI Picker
  const dateValue: Dayjs | null = selectedDate ? dayjs(selectedDate) : null;

  return (
    <div className="py-2 md:py-2">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        
        {/* --- MUI DATE FILTER --- */}
        <div className="flex justify-center mb-6">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box 
              sx={{ 
                minWidth: 280, 
                bgcolor: 'background.paper', 
                borderRadius: 2, 
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' 
              }}
              className="border border-[#E5E7EB] dark:border-[#4B5563]"
            >
              <DesktopDatePicker
                label="Filter Dashboard by Date"
                value={dateValue}
                onChange={(newDate) => {
                  const dateString =
                    newDate && dayjs.isDayjs(newDate) && newDate.isValid()
                      ? newDate.format('YYYY-MM-DD') 
                      : '';
                  setSelectedDate(dateString);
                }}
                slotProps={{
                  field: {
                    clearable: true,
                    onClear: () => setSelectedDate(''),
                  },
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: {
                      '& .MuiInputBase-root': {
                        borderRadius: '0.5rem',
                      },
                      '& .MuiInputLabel-root': { 
                        fontWeight: 500 
                      },
                    },
                  },
                }}
                format="DD-MMM-YYYY"
              />
            </Box>
          </LocalizationProvider>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Pass selectedDate down */}
          <StatusCards selectedDate={selectedDate} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="h-full">
              <OrderImportsCard /> {/* Unaffected */}
            </div>
            <div className="h-full">
              <UpcomingOrders /> {/* Unaffected */}
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
        </motion.div>
      </div>
    </div>
  );
}