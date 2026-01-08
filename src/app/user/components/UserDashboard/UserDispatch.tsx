// app/user/components/UserDashboard/UserDispatch.tsx
import React from "react";
import { useDispatchSummary } from "../../hooks/useDispatch";
import { Clock, CheckCircle, ClipboardCheck } from "lucide-react";

export default function UserDispatch() {
  const { data, loading, error } = useDispatchSummary();

  const ordersToBeDispatched = data?.ordersToBeDispatched ?? 0;
  const readyForDispatchToday = data?.readyForDispatchToday ?? 0;
  const ordersDispatchedToday = data?.ordersDispatchedToday ?? 0;

  return (
    <div className="w-full h-full">
      <div className="bg-white dark:bg-[#1F2933] rounded-2xl shadow-md overflow-hidden border border-[#E5E7EB] dark:border-[#4B5563] w-full h-full min-h-[520px] flex flex-col transition-all">

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
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading dispatch data...</p>
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
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full grid place-items-center bg-yellow-50 dark:bg-yellow-900/20">
                  <Clock className="w-8 h-8 lg:w-10 lg:h-10 text-yellow-600 dark:text-yellow-400" />
                </div>
                <p className="text-sm text-[#4B5563] dark:text-[#E5E7EB] text-center font-medium">
                  Orders to be Dispatched
                </p>
                <div className="text-4xl lg:text-5xl font-extrabold text-yellow-600 dark:text-yellow-400">
                  {ordersToBeDispatched}
                </div>
              </div>

              {/* Divider 1 */}
              <div className="hidden sm:block h-24 lg:h-32 w-px bg-[#E5E7EB] dark:bg-[#4B5563]" />

              {/* 2. Ready for Dispatch Today (NEW) */}
              <div className="flex flex-col items-center gap-3 flex-1">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full grid place-items-center bg-blue-50 dark:bg-blue-900/20">
                  <ClipboardCheck className="w-8 h-8 lg:w-10 lg:h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-[#4B5563] dark:text-[#E5E7EB] text-center font-medium">
                  Ready for Dispatch
                </p>
                <div className="text-4xl lg:text-5xl font-extrabold text-blue-600 dark:text-blue-400">
                  {readyForDispatchToday}
                </div>
              </div>

              {/* Divider 2 */}
              <div className="hidden sm:block h-24 lg:h-32 w-px bg-[#E5E7EB] dark:bg-[#4B5563]" />

              {/* 3. Orders Dispatched Today */}
              <div className="flex flex-col items-center gap-3 flex-1">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full grid place-items-center bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="w-8 h-8 lg:w-10 lg:h-10 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-[#4B5563] dark:text-[#E5E7EB] text-center font-medium">
                  Orders Dispatched
                </p>
                <div className="text-4xl lg:text-5xl font-extrabold text-green-600 dark:text-green-400">
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
