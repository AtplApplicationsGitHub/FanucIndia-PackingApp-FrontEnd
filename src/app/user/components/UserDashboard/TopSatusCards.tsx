"use client";

import React, { useState } from "react";
import { ShoppingCart, Truck } from "lucide-react";
import { useTopStatusCards } from "../../hooks/useTopStatusCards";

// MUI Date Picker Imports
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, loading = false }) => {
  return (
    <div className="relative group rounded-xl bg-white dark:bg-[#1F2933] border border-[#E5E7EB] dark:border-[#4B5563] px-6 py-6 shadow-sm transition-all hover:shadow-md min-h-[110px]">
      <div className="flex items-center justify-between gap-5">
        <div className="flex-1 text-center">
          <p className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
            {title}
          </p>
          <div className="mt-2 flex justify-center h-10 items-center">
            {loading ? (
              <div className="h-10 w-32 bg-[#E5E7EB] dark:bg-[#2C3540] rounded animate-pulse" />
            ) : (
              <p className="text-xl font-extrabold text-[#1F2933] dark:text-white leading-tight">
                {new Intl.NumberFormat().format(Number(value ?? 0))}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 grid place-items-center h-14 w-14 rounded-xl bg-[#F7F7F7] dark:bg-[#2C3540]">
          <div className="text-xl">{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default function StatsCards() {
  // Use Dayjs object for MUI DatePicker state, initialized to today
  const [filterDate, setFilterDate] = useState<Dayjs | null>(dayjs());

  // Format the Dayjs object to a string (YYYY-MM-DD) for the API, or undefined if cleared
  const dateString = filterDate ? filterDate.format("YYYY-MM-DD") : undefined;
  
  // Pass the formatted string to your hook
  const { data, loading } = useTopStatusCards(dateString);

  const assignedOrders = data?.assignedOrdersCount ?? 0;
  const completedOrders = data?.completedOrdersCount ?? 0;
  const overdueOrders = data?.overdueOrdersCount ?? 0;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Custom Card for Assigned Orders to accommodate the MUI Date Picker & Split View */}
        <div className="relative group rounded-xl bg-white dark:bg-[#1F2933] border border-[#E5E7EB] dark:border-[#4B5563] px-6 py-4 shadow-sm transition-all hover:shadow-md min-h-[110px]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
              Orders Assigned To Me
            </p>
            
            <div className="flex items-center">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={filterDate}
                  onChange={(newValue) => setFilterDate(newValue)}
                  format="DD/MM/YYYY"
                  label="Date"
                  slotProps={{
                    field: { clearable: true }, // Adds the built-in 'X' to clear the date
                    textField: {
                      size: "small",
                      sx: {
                        width: "185px",
                        // Dynamic styling to support both light and dark modes
                        "& .MuiInputBase-root": {
                          fontSize: "0.875rem",
                          color: "inherit", 
                          backgroundColor: "transparent",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(156, 163, 175, 0.5)", // Subtly matches standard borders
                        },
                        "& .MuiSvgIcon-root": {
                          color: "inherit", // Inherits dark/light text color for calendar/clear icons
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#9CA3AF",
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mt-2">
            <div className="flex-1 flex justify-center divide-x divide-gray-200 dark:divide-gray-700">
              {/* PENDING / CURRENT QUEUE */}
              <div className="flex-1 text-center px-2">
                <p className="text-xs text-gray-500 font-medium mb-1">PENDING</p>
                {loading ? (
                  <div className="h-8 w-16 bg-[#E5E7EB] dark:bg-[#2C3540] rounded animate-pulse mx-auto" />
                ) : (
                  <p className="text-xl font-extrabold text-[#1F2933] dark:text-white">
                    {new Intl.NumberFormat().format(Number(assignedOrders))}
                  </p>
                )}
              </div>
              
              {/* COMPLETED (Only visible if a date is selected) */}
              {filterDate && (
                <div className="flex-1 text-center px-2">
                  <p className="text-xs text-green-600 font-medium mb-1">COMPLETED</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-[#E5E7EB] dark:bg-[#2C3540] rounded animate-pulse mx-auto" />
                  ) : (
                    <p className="text-xl font-extrabold text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat().format(Number(completedOrders))}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 grid place-items-center h-14 w-14 rounded-xl bg-[#F7F7F7] dark:bg-[#2C3540]">
              <ShoppingCart className=" text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Regular Overdue Card */}
        <StatCard
          title="Overdue Orders"
          value={overdueOrders}
          icon={<Truck className="h-6 w-6 text-green-600 dark:text-green-400" />}
          loading={loading}
        />
      </div>
    </div>
  );
}