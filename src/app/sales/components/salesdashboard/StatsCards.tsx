// components/sales/salesdashboard/StatsCards.tsx
"use client";

import React from "react";
import { ShoppingCart, Truck, AlertTriangle } from "lucide-react";
import { useSalesDashboard } from "../../components/hooks/StatsCards";
import { Skeleton, useTheme } from "@mui/material";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgColor?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = "bg-white",
  loading = false,
}) => {
  const theme = useTheme();
  return (
    <div className="relative group rounded-xl bg-white border border-gray-100 px-6 py-6 shadow-sm transition-all hover:shadow-md min-h-[110px]">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <p 
            className="text-md font-semibold uppercase tracking-wide"
            style={{ color: theme.palette.secondary.main }} // <-- CHANGED
          >
            {title}
          </p>
          <p className="mt-2 text-4xl font-extrabold text-gray-900 leading-tight">
            {loading ? (
              <Skeleton width={120} height={48} />
            ) : (
              new Intl.NumberFormat().format(Number(value ?? 0))
            )}
          </p>
        </div>

        <div className={`flex-shrink-0 grid place-items-center h-14 w-14 rounded-lg ${iconBgColor}`}>
          <div className="text-xl text-gray-700">{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default function StatsCards() {
  const { data, loading } = useSalesDashboard();

  const totalOrders = data?.totalSoCount ?? 0;
  const dispatched = data?.dispatchedSoCount ?? 0;
  // pending = awaiting dispatch
  const pending = Math.max(0, totalOrders - dispatched);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Orders Created"
          value={totalOrders}
          icon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
          iconBgColor="bg-blue-50"
          loading={loading}
        />

        <StatCard
          title="Awaiting for Dispatch"
          value={pending}
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          iconBgColor="bg-red-50"
          loading={loading}
        />

        <StatCard
          title="Dispatched Orders"
          value={dispatched}
          icon={<Truck className="h-6 w-6 text-green-600" />}
          iconBgColor="bg-green-50"
          loading={loading}
        />
      </div>
    </div>
  );
}
