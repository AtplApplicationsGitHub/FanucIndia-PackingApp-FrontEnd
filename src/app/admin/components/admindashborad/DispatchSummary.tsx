// app/admin/components/admindashboard/DispatchSummary.tsx
import React from "react";
import { useDispatchSummary } from "../hooks/useDispatchSummary";
import { Clock, CheckCircle, ClipboardCheck } from "lucide-react";
import { useTheme } from "@mui/material";

export default function DispatchSummary() {
  const theme = useTheme();
  const { data, loading, error } = useDispatchSummary();

  const ordersToBeDispatched = data?.ordersToBeDispatched ?? 0;
  const readyForDispatchToday = data?.readyForDispatchToday ?? 0;
  const ordersDispatchedToday = data?.ordersDispatchedToday ?? 0;

  return (
    <div className="w-full h-full">
      <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm border border-[#E5E7EB] dark:border-[#4B5563] w-full min-h-[543px] flex flex-col">

        {/* Header */}
        <div className="px-6 pt-6">
          <h2 className="text-lg uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
            Today&apos;s Dispatch
          </h2>
        </div>

        {/* Center Content */}
        <div className="flex flex-1 items-center justify-center p-6">
          {loading ? (
            <div className="flex flex-col items-center gap-8">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#3B82F6]"></div>
              <p className="text-[#4B5563] dark:text-[#E5E7EB]">Loading dispatch data...</p>
            </div>
          ) : error ? (
            <div className="text-center text-[#D00000] dark:text-[#FF6B6B]">
              <p>Error loading data</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 lg:gap-10 w-full">

              {/* 1. Orders to be Dispatched */}
              <div className="flex flex-col items-center gap-3 flex-1">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full grid place-items-center bg-yellow-50 dark:bg-yellow-900/10">
                  <Clock className="w-8 h-8 lg:w-10 lg:h-10 text-[#FFD93D]" />
                </div>
                <p className="text-sm text-[#4B5563] dark:text-[#9CA3AF] text-center font-medium">
                  Orders to be Dispatched
                </p>
                <div className="text-4xl lg:text-5xl font-extrabold text-[#FFD93D]">
                  {ordersToBeDispatched}
                </div>
              </div>

              {/* Divider 1 */}
              <div className="hidden sm:block h-24 lg:h-32 w-px bg-[#E5E7EB] dark:bg-[#4B5563]" />

              {/* 2. Ready for Dispatch Today (NEW) */}
              <div className="flex flex-col items-center gap-3 flex-1">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full grid place-items-center bg-blue-50 dark:bg-blue-900/10">
                  <ClipboardCheck className="w-8 h-8 lg:w-10 lg:h-10 text-[#3B82F6]" />
                </div>
                <p className="text-sm text-[#4B5563] dark:text-[#9CA3AF] text-center font-medium">
                  Ready for Dispatch
                </p>
                <div className="text-4xl lg:text-5xl font-extrabold text-[#3B82F6]">
                  {readyForDispatchToday}
                </div>
              </div>

              {/* Divider 2 */}
              <div className="hidden sm:block h-24 lg:h-32 w-px bg-[#E5E7EB] dark:bg-[#4B5563]" />

              {/* 3. Orders Dispatched Today */}
              <div className="flex flex-col items-center gap-3 flex-1">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full grid place-items-center bg-green-50 dark:bg-green-900/10">
                  <CheckCircle className="w-8 h-8 lg:w-10 lg:h-10 text-[#00B894]" />
                </div>
                <p className="text-sm text-[#4B5563] dark:text-[#9CA3AF] text-center font-medium">
                  Orders Dispatched
                </p>
                <div className="text-4xl lg:text-5xl font-extrabold text-[#00B894]">
                  {ordersDispatchedToday}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-[#9CA3AF]">
            <span suppressHydrationWarning>
              Updated: {new Date().toLocaleDateString()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}