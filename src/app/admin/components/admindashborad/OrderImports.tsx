// components/OrderImportsCard.tsx
import React from "react";
import { useOrderImports } from "../hooks/useOrderImports";

export default function OrderImportsCard() {
  const { data: stats, loading, error, refetch } = useOrderImports();

  return (
    <div className="w-full">
      <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md p-6  min-h-[455px]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Order Imports (Last 5 Days)
          </h3>
          {loading && <span className="text-xs text-slate-500">Loading...</span>}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-12 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {stats?.map((s, idx) => (
              <li
                key={s.date}
                className="py-4 flex items-center justify-between first:pt-0 last:pb-0"
              >
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  {s.dayLabel}
                </span>
                <span
                  className={`text-base font-semibold tabular-nums ${
                    idx === stats.length - 1
                      ? "text-sky-600 dark:text-sky-400"
                      : "text-slate-800 dark:text-slate-100"
                  }`}
                >
                  {s.count}
                </span>
              </li>
            ))}
          </ul>
        )}

        {error && !loading && (
          <div className="mt-4 text-center py-6 text-sm">
            <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
            <button
              onClick={refetch}
              className="text-sky-600 dark:text-sky-400 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}