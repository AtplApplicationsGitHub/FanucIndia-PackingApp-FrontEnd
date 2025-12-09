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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 w-full min-h-[543px] flex flex-col">

        {/* Header */}
        <div className="px-6 pt-6">
          <h2 
            className="text-lg uppercase font-semibold"
            style={{ color: theme.palette.secondary.main }}
          >
            Today&apos;s Dispatch
          </h2>
        </div>

        {/* Center Content */}
        <div className="flex flex-1 items-center justify-center p-6">
          {loading ? (
            <div className="flex flex-col items-center gap-8">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
              <p className="text-gray-500">Loading dispatch data...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              <p>Error loading data</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 lg:gap-10 w-full">

              {/* 1. Orders to be Dispatched */}
              <div className="flex flex-col items-center gap-3 flex-1">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full grid place-items-center bg-yellow-50 dark:bg-yellow-900/10">
                  <Clock className="w-8 h-8 lg:w-10 lg:h-10 text-yellow-600 dark:text-yellow-300" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-medium">
                  Orders to be Dispatched
                </p>
                <div className="text-4xl lg:text-5xl font-extrabold text-yellow-600 dark:text-yellow-300">
                  {ordersToBeDispatched}
                </div>
              </div>

              {/* Divider 1 */}
              <div className="hidden sm:block h-24 lg:h-32 w-px bg-gray-200 dark:bg-gray-700" />

              {/* 2. Ready for Dispatch Today (NEW) */}
              <div className="flex flex-col items-center gap-3 flex-1">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full grid place-items-center bg-blue-50 dark:bg-blue-900/10">
                  <ClipboardCheck className="w-8 h-8 lg:w-10 lg:h-10 text-blue-600 dark:text-blue-300" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-medium">
                  Ready for Dispatch
                </p>
                <div className="text-4xl lg:text-5xl font-extrabold text-blue-600 dark:text-blue-300">
                  {readyForDispatchToday}
                </div>
              </div>

              {/* Divider 2 */}
              <div className="hidden sm:block h-24 lg:h-32 w-px bg-gray-200 dark:bg-gray-700" />

              {/* 3. Orders Dispatched Today */}
              <div className="flex flex-col items-center gap-3 flex-1">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full grid place-items-center bg-green-50 dark:bg-green-900/10">
                  <CheckCircle className="w-8 h-8 lg:w-10 lg:h-10 text-green-600 dark:text-green-300" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-medium">
                  Orders Dispatched
                </p>
                <div className="text-4xl lg:text-5xl font-extrabold text-green-600 dark:text-green-300">
                  {ordersDispatchedToday}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-400">
            <span suppressHydrationWarning>
              Updated: {new Date().toLocaleDateString()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}