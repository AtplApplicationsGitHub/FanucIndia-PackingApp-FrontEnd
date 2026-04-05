"use client";

import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import { ShoppingCart, Truck, AlertTriangle, PackageCheck, Clock, Send } from "lucide-react";
import { useDispatchSummary } from "../hooks/useDispatchSummary";
import type { StatusCardData } from "../types/admin";

// extend iconMap to include dispatch icons 
const iconMap: Record<string, React.ReactNode> = {
  cart: <ShoppingCart className="w-7 h-7" />,
  truck: <Truck className="w-7 h-7" />,
  alert: <AlertTriangle className="w-7 h-7" />,
  packageCheck: <PackageCheck className="w-7 h-7" />,
  clock: <Clock className="w-7 h-7" />,
  send: <Send className="w-7 h-7" />,
};

// percentage & isPositive are now optional
interface StatCardProps extends Omit<StatusCardData, "percentage" | "isPositive"> {
  percentage?: string;
  isPositive?: boolean;
  dateText?: string; // <-- Added to display static date text
}

const StatCard = ({
  title,
  value,
  percentage,
  isPositive,
  iconType,
  iconColor,
  dateText,
}: StatCardProps) => {
  return (
    <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-5 border border-[#E5E7EB] dark:border-[#4B5563] hover:shadow-md transition-all flex flex-col justify-center">
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-3">
          {/* --- TITLE & STATIC DATE ROW --- */}
          <div className="flex items-center justify-between gap-3 w-full">
            <p className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
              {title}
            </p>
            {/* Renders the date string if it is passed in */}
            {dateText && (
              <span className="text-sm font-medium text-[#4B5563] dark:text-[#E5E7EB]">
                {dateText}
              </span>
            )}
          </div>

          <p className="text-xl font-bold text-[#1F2933] dark:text-white mt-2">
            {value}
          </p>

          {percentage !== undefined && (
            <div className="flex items-center mt-1 text-sm text-[#4B5563] dark:text-[#E5E7EB]">
              <span>vs last month</span>
              <div
                className={`flex items-center ml-2 ${
                  isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-[#D00000] dark:text-red-400"
                }`}
              >
                {isPositive ? (
                  <ArrowUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4" />
                )}
                <span className="ml-1 font-medium">{percentage}</span>
              </div>
            </div>
          )}
        </div>

        <div
          className={`w-14 h-14 shrink-0 flex items-center justify-center rounded-xl bg-[#F7F7F7] dark:bg-[#2C3540] ${iconColor}`}
        >
          {iconMap[iconType]}
        </div>
      </div>
    </div>
  );
};

const SkeletonRow = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563] animate-pulse"
      >
        <div className="h-5 bg-[#E5E7EB] dark:bg-[#2C3540] rounded w-32 mb-3" />
        <div className="h-10 bg-[#E5E7EB] dark:bg-[#2C3540] rounded w-24" />
      </div>
    ))}
  </div>
);

const ErrorBanner = ({ message }: { message: string }) => (
  <div className="col-span-full text-center p-8 bg-red-50 dark:bg-red-900/30 rounded-xl text-[#D00000] dark:text-red-400 border border-red-200 dark:border-red-800">
    Something went wrong while loading your data : {message}
  </div>
);

// Helper to format "YYYY-MM-DD" to "DD-MMM-YYYY" without needing dayjs
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Main component 
const StatusCards = ({ selectedDate, setSelectedDate }: { selectedDate: string, setSelectedDate: (date: string) => void }) => {
  const { data: dispatch, loading: dispatchLoading, error: dispatchError } = useDispatchSummary();

  const dispatchCards: StatCardProps[] = dispatch
    ? [
        {
          title: "To Be Dispatched",
          value: dispatch.ordersToBeDispatched,
          iconType: "packageCheck",
          iconColor: "text-blue-500 dark:text-blue-400",
        },
        {
          title: "Ready for Dispatch Today",
          value: dispatch.readyForDispatchToday,
          iconType: "clock",
          iconColor: "text-yellow-500 dark:text-yellow-400",
        },
        {
          title: "Dispatched Today",
          value: dispatch.ordersDispatchedToday,
          iconType: "send",
          iconColor: "text-green-500 dark:text-green-400",
          dateText: formatDate(selectedDate), // <-- Pass the formatted static date string here
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-3">
      {dispatchLoading ? (
        <SkeletonRow />
      ) : dispatchError ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ErrorBanner message={dispatchError} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xl text-[#1F2933] dark:text-[#F7F7F7] uppercase font-semibold">
          {dispatchCards.map((card, idx) => (
            <StatCard key={idx} {...card} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusCards;