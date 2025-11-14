import React from "react";

type DispatchSummaryProps = {
  ordersToBeDispatched?: number;
  ordersDispatchedToday?: number;
};

export default function DispatchSummary({
  ordersToBeDispatched = 8,
  ordersDispatchedToday = 22,
}: DispatchSummaryProps) {
  return (
    <section className="max-w-sm mx-auto p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="px-6 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Today's Dispatch Summary</h2>
        </div>

        <div className="p-6 flex flex-col items-center gap-6">
          {/* Top card: Orders to be dispatched */}
          <div className="w-full flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full grid place-items-center bg-yellow-50 dark:bg-yellow-900/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-yellow-600 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
              </svg>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">Orders to be Dispatched</p>
            <div className="text-4xl sm:text-5xl font-extrabold text-yellow-600 dark:text-yellow-300">{ordersToBeDispatched}</div>
          </div>

          <div className="w-full border-t border-gray-100 dark:border-gray-700" />

          {/* Bottom card: Orders dispatched today */}
          <div className="w-full flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full grid place-items-center bg-green-50 dark:bg-green-900/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h2l3 5 4-8 3 6h4" />
              </svg>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">Orders Dispatched Today</p>
            <div className="text-4xl sm:text-5xl font-extrabold text-green-600 dark:text-green-300">{ordersDispatchedToday}</div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <p className="text-xs text-gray-400">Updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </section>
  );
}
