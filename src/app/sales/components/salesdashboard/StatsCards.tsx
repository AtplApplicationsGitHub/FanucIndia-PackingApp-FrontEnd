"use client";

import React, { useState, useEffect } from "react";
import { PackageCheck, Clock, Send } from "lucide-react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import IconButton from "@mui/material/IconButton";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Skeleton } from "@mui/material";

const iconMap: Record<string, React.ReactNode> = {
  packageCheck: <PackageCheck className="w-7 h-7" />,
  clock: <Clock className="w-7 h-7" />,
  send: <Send className="w-7 h-7" />,
};

const StatCard = ({ title, value, iconType, iconColor, hasDatePicker, selectedDate, onDateChange, loading }: any) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-5 border border-[#E5E7EB] dark:border-[#4B5563] hover:shadow-md transition-all flex flex-col justify-center">
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-3">
          <div className="flex items-center justify-between gap-3 w-full">
            <p className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">{title}</p>
            {hasDatePicker && onDateChange && (
              <div className="flex items-center gap-0.5">
                <span className="text-sm font-medium text-[#4B5563] dark:text-[#E5E7EB] mr-1 mt-0.5">
                  {dayjs(selectedDate).format('DD-MMM-YYYY')}
                </span>
                <IconButton onClick={() => setCalendarOpen(true)} size="small" sx={{ color: "text.secondary" }}>
                  <CalendarMonthIcon fontSize="small" />
                </IconButton>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    open={calendarOpen}
                    onClose={() => setCalendarOpen(false)}
                    value={selectedDate ? dayjs(selectedDate) : null}
                    onChange={(newDate) => {
                      const dateString = newDate && dayjs.isDayjs(newDate) && newDate.isValid() ? newDate.format('YYYY-MM-DD') : '';
                      if (dateString) onDateChange(dateString);
                    }}
                    format="DD-MMM-YYYY"
                    slotProps={{
                      textField: {
                        sx: {
                          width: 0,
                          height: 0,
                          opacity: 0,
                          padding: 0,
                          margin: 0,
                          minWidth: 0,
                          pointerEvents: 'none' // Prevents accidental clicks
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
              </div>
            )}
          </div>
          <p className="text-xl font-bold text-[#1F2933] dark:text-white mt-2">
            {loading ? <Skeleton width={60} height={40} /> : (value !== undefined ? value : 0)}
          </p>
        </div>
        <div className={`w-14 h-14 shrink-0 flex items-center justify-center rounded-xl bg-[#F7F7F7] dark:bg-[#2C3540] ${iconColor}`}>
          {iconMap[iconType]}
        </div>
      </div>
    </div>
  );
};

export default function StatsCards({ selectedDate, setSelectedDate }: { selectedDate: string, setSelectedDate: (date: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API.DASHBOARD.SALES_DISPATCH_SUMMARY}?date=${selectedDate}`);
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error("Error fetching sales dispatch summary", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  const cards = [
    { title: "To Be Dispatched", value: data?.ordersToBeDispatched, iconType: "packageCheck", iconColor: "text-blue-500 dark:text-blue-400", loading },
    { title: "Ready for Dispatch Today", value: data?.readyForDispatchToday, iconType: "clock", iconColor: "text-yellow-500 dark:text-yellow-400", loading },
    { title: "Dispatched Today", value: data?.ordersDispatchedToday, iconType: "send", iconColor: "text-green-500 dark:text-green-400", hasDatePicker: true, selectedDate, onDateChange: setSelectedDate, loading },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xl text-[#1F2933] dark:text-[#F7F7F7] uppercase font-semibold">
        {cards.map((card, idx) => <StatCard key={idx} {...card} />)}
      </div>
    </div>
  );
}