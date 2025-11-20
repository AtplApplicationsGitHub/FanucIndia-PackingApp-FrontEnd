// components/OrderImportsCard.tsx
import React from "react";
import { useOrderImports } from "../hooks/useOrderImports";
import { RefreshCw } from "lucide-react";

export default function OrderImportsCard() {
  const { data: stats, loading, error, refetch } = useOrderImports();

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md p-6 min-h-[455px]">
          <div className="flex items-center justify-between mb-5">
            <p className="text-lg text-slate-800 dark:text-slate-100 uppercase font-semibold">
              Order Imports (Last 5 Days)
            </p>
            <span className="text-xs text-slate-500">Loading...</span>
          </div>

          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md p-6 min-h-[517px]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl  text-slate-800 dark:text-slate-100 uppercase font-semibold">
            Order Imports (Last 5 Days)
          </h3>


          {error && (
            <button
              onClick={refetch}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>

        {/* Success: Show list with Today at the top */}
        {!error && stats && stats.length > 0 && (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {stats.map((s, idx) => (
              <li
                key={s.date}
                className="py-4 flex items-center justify-between first:pt-0 last:pb-0"
              >
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {s.dayLabel}
                </span>

                {/* Highlight TODAY in blue */}
                <span
                  className={`text-base font-semibold tabular-nums ${idx === 0
                      ? "text-sky-600 dark:text-sky-400"
                      : "text-slate-800 dark:text-slate-100"
                    }`}
                >
                  {s.count.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Error state – centered */}
        {error && (
          <div className="mt-10 text-center py-16">
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}