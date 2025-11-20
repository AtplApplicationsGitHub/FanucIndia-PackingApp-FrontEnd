// components/OrdersByProduct.tsx
import React from "react";
import { useOrdersByProduct, OrderByProduct } from "../hooks/useOrdersByProduct";
import { useTheme } from "@mui/material";

type Props = {
  /**
   * Max height of the scrollable list area.
   * Can be a number (pixels) or any CSS size string.
   * Default: 360px
   */
  maxHeight?: number | string;
  className?: string;
};

function formatNumber(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function OrdersByProduct({
  maxHeight = 360,
  className = "",
}: Props) {
  const theme = useTheme();
  const { data, loading, error } = useOrdersByProduct();

  // Safely handle null/undefined → default to empty array while loading
  const items: OrderByProduct[] = (data ?? []) as OrderByProduct[];
  const hasData = items.length > 0;

  const resolvedMaxHeight =
    typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

  return (
    <section
      className={`h-full ${className}`}
      aria-labelledby="orders-by-product"
    >
      <div className="flex flex-col h-full rounded-2xl bg-white/95 dark:bg-slate-900/75 shadow-lg p-6 border border-gray-100 dark:border-slate-800">
        <header className="flex items-start justify-between mb-4">
          <div>
            <p
              id="orders-by-product"
              className="text-lg uppercase font-semibold"
              style={{ color: theme.palette.secondary.main }}
            >
              Orders by Product
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Top products by order count
            </p>
          </div>

          {/* small legend or action placeholder (kept for parity with other component) */}
          <div aria-hidden={true} className="text-xs text-slate-400">
            {/* reserved */}
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading products...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-red-600 dark:text-red-400 text-sm">Error: {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !hasData && (
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No orders yet</p>
          </div>
        )}

        {/* Data List */}
        {!loading && !error && hasData && (
          <>
            <div
              className="content flex-1 overflow-y-auto overflow-x-hidden divide-y divide-slate-100 dark:divide-slate-800 rounded-md"
              style={{ maxHeight: resolvedMaxHeight }}
              role="list"
              tabIndex={0}
              aria-label="Orders by product list"
            >
              {items.map((item, idx) => {
                return (
                  <div
                    key={`${item.name ?? "product"}-${idx}`}
                    className="flex items-center justify-between gap-4 px-2 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    role="listitem"
                    aria-label={`${item.name} — ${item.count} orders`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Name */}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                          {item.name}
                        </p>
                      </div>
                    </div>

                    {/* Count badge */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                          {formatNumber(item.count)}
                        </span>
                        <div className="text-xs text-slate-400 dark:text-slate-500">orders</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-4 flex justify-end">
              <div className="w-fit text-xs px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 shadow-sm">
                Showing {items.length} product{items.length !== 1 ? "s" : ""}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Custom scrollbar styling */}
      <style jsx>{`
        :global(.content) {
          scrollbar-width: thin;
        }
        :global(.content::-webkit-scrollbar) {
          width: 10px;
          height: 10px;
        }
        :global(.content::-webkit-scrollbar-track) {
          background: transparent;
        }
        :global(.content::-webkit-scrollbar-thumb) {
          background-color: rgba(99, 102, 241, 0.15);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        :global(.content) {
          overflow-x: hidden;
        }
      `}</style>
    </section>
  );
}
