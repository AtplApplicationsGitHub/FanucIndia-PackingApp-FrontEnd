// app/admin/components/OrdersByCustomer.tsx
import React from "react";
import { useOrdersByCustomer } from "../hooks/useOrdersbyCustomer";

type Customer = {
  name: string;
  count: number;
  isActive?: boolean;
  lastActive?: string;
  avatarUrl?: string | null;
};

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export default function OrdersByCustomer({
  className = "",
}: { className?: string }) {
  const { data, loading, error } = useOrdersByCustomer();

  const items: Customer[] = (data as Customer[]) ?? [];
  const hasData = items.length > 0;

  return (
    <section
      className={`h-full ${className}`}
      aria-labelledby="orders-by-customer"
    >
      <div className="flex flex-col h-full rounded-xl bg-white dark:bg-[#1F2933] shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563]">
        <header className="flex items-start justify-between mb-4">
          <div>
            <p
              id="orders-by-customer"
              className="text-lg uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]"
            >
              Orders by Customer
            </p>
            <p className="mt-1 text-sm text-[#4B5563] dark:text-[#E5E7EB]">
              Customers by order count
            </p>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-[#4B5563] dark:text-[#E5E7EB] flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
              <span>Loading customers...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-[#D00000] dark:text-[#FF6B6B] text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !hasData && (
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-[#4B5563] dark:text-[#E5E7EB] text-sm">
              No customers found
            </p>
          </div>
        )}

        {/* Data List */}
        {!loading && !error && hasData && (
          <>
            <div
              className="content flex-1 divide-y divide-[#E5E7EB] dark:divide-[#4B5563] rounded-md"
              role="list"
              aria-label="Customers by order count"
            >
              {items.map((c, idx) => {
                const active = !!c.isActive;

                return (
                  <div
                    key={`${c.name}-${idx}`}
                    className="flex items-center justify-between gap-4 px-2 py-4 hover:bg-[#F7F7F7] dark:hover:bg-[#2C3540] transition-colors"
                    role="listitem"
                    aria-label={`${c.name} — ${c.count} orders — ${
                      active ? "Active" : "Inactive"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1F2933] dark:text-[#E5E7EB] truncate">
                          {c.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-2xl font-semibold text-[#FFD93D] dark:text-[#FFD93D]">
                          {formatNumber(c.count)}
                        </span>
                        <div className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                          orders
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <div className="w-fit text-xs px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 shadow-sm">
                Total {items.length} Customers
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        :global(.content) {
          scrollbar-width: thin;
        }
        :global(.content::-webkit-scrollbar) {
          width: 10px;
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
      `}</style>
    </section>
  );
}