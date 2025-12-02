import React from "react";
import { useOrderImports } from "../hooks/useOrderImports";
import { RefreshCw , Calendar, AlertCircle } from "lucide-react";
import { useTheme } from "@mui/material";

export default function OrderImportsCard() {
  const theme = useTheme();
  const { data: stats, loading, error, refetch } = useOrderImports();

  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-lg p-6 min-h-[455px] border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-2 animate-pulse" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
            </div>
            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>

          {/* Summary cards skeleton */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-20 mb-2 animate-pulse" />
                <div className="h-6 bg-slate-200 dark:bg-slate-600 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>

          {/* List skeleton */}
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-600 rounded-full animate-pulse" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-24 animate-pulse" />
                </div>
                <div className="h-6 bg-slate-200 dark:bg-slate-600 rounded w-12 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-lg p-6 min-h-[500px] border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 
              className="text-lg uppercase font-semibold"
              style={{ color: theme.palette.secondary.main }}
            >
              Orders Created
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
              <Calendar className="w-4 h-4" />
              Last 5 Days
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-8 text-center py-12 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-2 font-medium">Failed to load data</p>
            <p className="text-sm text-red-500 dark:text-red-300 mb-6 max-w-sm mx-auto">
              {error}
            </p>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Success: Show list with Today at the top */}
        {!error && stats && stats.length > 0 && (
          <div className="space-y-2">
            {stats.map((s, idx) => (
              <div
                key={s.date}
                // All items use the yellow hover styles — default bg/border still differ for the first item
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:border-yellow-300 dark:hover:border-yellow-700 ${idx === 0
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700"
                    : "bg-slate-50 dark:bg-slate-700/30 border-slate-100 dark:border-slate-600"
                  }`}
              >
                <div className="flex items-center gap-4">
                  {/* Day indicator with different colors */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm ${idx === 0
                      ? "bg-sky-500 text-white"
                      : idx === 1
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
                        : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                    }`}>
                    {s.dayLabel.substring(0, 3)}
                  </div>

                  <div>
                    <span className={`text-sm font-medium block ${idx === 0
                        ? "text-sky-700 dark:text-sky-300"
                        : "text-slate-700 dark:text-slate-300"
                      }`}>
                      {s.dayLabel}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {s.date}
                    </span>
                  </div>
                </div>

                {/* Count with visual indicator for today */}
                <div className="flex items-center gap-3">
                  {idx === 0 && (
                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                  )}
                  <span
                    className={`text-lg font-bold tabular-nums ${idx === 0
                        ? "text-sky-600 dark:text-sky-400"
                        : "text-slate-800 dark:text-slate-100"
                      }`}
                  >
                    {s.count.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!error && (!stats || stats.length === 0) && (
          <div className="mt-8 text-center py-12 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400 dark:text-slate-300" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-2 font-medium">No data available</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              No order imports found for the last 5 days
            </p>
            
          </div>
        )}
      </div>
    </div>
  );
}
