// app/admin/components/admindashboard/DispatchSummary.tsx
import React from "react";
import { useDispatchSummary } from "../hooks/useDispatchSummary";

export default function DispatchSummary() {
  const { data, loading, error } = useDispatchSummary();

  // Fallback defaults while loading
  const ordersToBeDispatched = data?.ordersToBeDispatched ?? 0;
  const ordersDispatchedToday = data?.ordersDispatchedToday ?? 0;

  return (
    <div className="w-full h-full">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 w-full min-h-[457px] flex flex-col">

        {/* Header */}
        <div className="px-6 pt-6">
          <p className="text-lg font-semibold">Today&apos;s Dispatch</p>
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
            <div className="flex flex-row items-center justify-center gap-16">

              {/* Orders to be dispatched */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full grid place-items-center bg-yellow-50 dark:bg-yellow-900/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-yellow-600 dark:text-yellow-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
                  </svg>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Orders to be Dispatched Today                </p>

                <div className="text-5xl font-extrabold text-yellow-600 dark:text-yellow-300">
                  {ordersToBeDispatched}
                </div>
              </div>

              {/* Divider */}
              <div className="h-32 w-px bg-gray-200 dark:bg-gray-700" />

              {/* Orders Dispatched Today */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full grid place-items-center bg-green-50 dark:bg-green-900/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-green-600 dark:text-green-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Orders Dispatched Today
                </p>

                <div className="text-5xl font-extrabold text-green-600 dark:text-green-300">
                  {ordersDispatchedToday}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-400">
            Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}