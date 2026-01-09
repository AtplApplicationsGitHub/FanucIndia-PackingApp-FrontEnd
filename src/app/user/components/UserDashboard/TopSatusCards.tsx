// components/sales/salesdashboard/StatsCards.tsx
"use client";

import React from "react";
import { ShoppingCart, Truck } from "lucide-react";
import { useTopStatusCards } from "../../hooks/useTopStatusCards";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  loading = false,
}) => {
  return (
    <div className="relative group rounded-xl bg-white dark:bg-[#1F2933] border border-[#E5E7EB] dark:border-[#4B5563] px-6 py-6 shadow-sm transition-all hover:shadow-md min-h-[110px]">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1 text-center">
          <p className="text-lg uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
            {title}
          </p>
          <div className="mt-2 flex justify-center h-10 items-center">
            {loading ? (
              <div className="h-10 w-32 bg-[#E5E7EB] dark:bg-[#2C3540] rounded animate-pulse" />
            ) : (
              <p className="text-4xl font-extrabold text-[#1F2933] dark:text-white leading-tight">
                {new Intl.NumberFormat().format(Number(value ?? 0))}
              </p>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 grid place-items-center h-14 w-14 rounded-xl bg-[#F7F7F7] dark:bg-[#2C3540]">
          <div className="text-xl">{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default function StatsCards() {
  const { data, loading } = useTopStatusCards();

  const assignedOrders = data?.assignedOrdersCount ?? 0;
  const overdueOrders = data?.overdueOrdersCount ?? 0;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard
          title="Orders Assigned to Me"
          value={assignedOrders}
          icon={<ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          loading={loading}
        />

        <StatCard
          title="Overdue Orders"
          value={overdueOrders}
          icon={<Truck className="h-6 w-6 text-green-600 dark:text-green-400" />}
          loading={loading}
        />
      </div>
    </div>
  );
}
