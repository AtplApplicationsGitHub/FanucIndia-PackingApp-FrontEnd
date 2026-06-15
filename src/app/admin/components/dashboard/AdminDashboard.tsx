"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Box, Typography, IconButton } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
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
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const displayDate = selectedDate ? formatDateIST(selectedDate) : "All Time";

  return (
    <div className="pb-2">
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Global date filter — drives every date-aware card/chart below */}
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "flex-start", sm: "flex-end" },
            alignItems: "center",
            gap: 0.5,
            mb: 0.5,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.secondary" }}
          >
            Dashboard Date: {displayDate}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={selectedDate ? dayjs(selectedDate) : null}
              onChange={(newValue) => {
                if (newValue) {
                  setSelectedDate(newValue.format("YYYY-MM-DD"));
                }
              }}
              minDate={dayjs().subtract(3, "day")}
              maxDate={dayjs().add(5, "day")}
              format="DD-MMM-YYYY"
              slots={{ openPickerIcon: CalendarMonthIcon }}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    width: 40,
                    "& .MuiInputBase-input": {
                      display: "none",
                      width: 0,
                      padding: 0,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "& .MuiInputAdornment-root": {
                      ml: 0,
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatusCards selectedDate={selectedDate} />

          {/* Row 3: Order Status by Customer */}
          <div className="w-full mt-6">
            <OrderStatusByCustomerChart
              selectedDate={selectedDate}
              displayDate={displayDate}
            />
          </div>

          {/* Row 4: Order Status by Sales Zone */}
          <div className="w-full mt-6">
            <OrderStatusByZone
              selectedDate={selectedDate}
              displayDate={displayDate}
            />
          </div>

          {/* Row 5: Orders Created / Upcoming Orders / Overall Order Status Count */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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

          {/* Row 6: Payment Clearance by Customer */}
          <div className="w-full mt-6">
            <PaymentClearanceByCustomerChart
              selectedDate={selectedDate}
              displayDate={displayDate}
            />
          </div>

          {/* Row 7: Payment Clearance by Sales Zone */}
          <div className="w-full mt-6">
            <PaymentClearanceChart
              selectedDate={selectedDate}
              displayDate={displayDate}
            />
          </div>

          {/* Row 8: Operator Productivity */}
          <div className="w-full mt-6">
            <OperatorStatsTable selectedDate={selectedDate} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
