"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useOrderOverallStatus, OrderOverallStatus } from "../hooks/useOrderStatusPieChart";

type DataItem = {
  name: string;
  value: number;
  code?: string;
  display: string;
};

const COLORS = ["#3B82F6", "#F97316", "#10B981", "#8B5CF6"];

const renderLabel = (entry: { percent?: number }) => {
  const percent = Math.round((entry.percent || 0) * 100);
  return percent > 0 ? `${percent}%` : null;
};

export default function OrderStatusPieChart() {
  const { data, loading, error } = useOrderOverallStatus();

  const transformData = (api: OrderOverallStatus): DataItem[] => {
    return [
      { name: "Imported", value: api.r105Count, code: "R105", display: "Imported (R105)" },
      { name: "Issued", value: api.w105Count, code: "W105", display: "Issued (W105)" },
      { name: "Packed", value: api.f105Count, code: "F105", display: "Packed (F105)" },
      { name: "Dispatched", value: api.dispatchedCount, display: "Dispatched" },
    ].filter(item => item.value > 0);
  };

  if (loading) {
    return (
      <div className="w-full bg-white/90 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-800 min-h-[400px] flex items-center justify-center">
        <div className="text-slate-500">Loading order status...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full bg-white/90 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-800 min-h-[400px] flex items-center justify-center">
        <div className="text-red-500">Error: {error || "No data"}</div>
      </div>
    );
  }

  const chartData = transformData(data);
  const total = data.totalOrders;

  return (
    <div className="w-full">
      <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl shadow-md p-6 border border-gray-100 dark:border-slate-800 min-h-[450px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3
              className="text-lg font-semibold text-black"
            >
              Overall Order Status count
            </h3>


            <p className="text-sm text-slate-500 dark:text-slate-400">
              Real-time breakdown of order lifecycle
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400">Total orders</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {total.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Chart + Bottom Legend */}
        <div className="relative">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="display"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={100}
                  paddingAngle={4}
                  labelLine={false}
                  label={renderLabel}
                  isAnimationActive={false}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => {
                    return [
                      `${value.toLocaleString()} orders`,
                      name
                    ];

                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Simple Bottom Legend - Only Names */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div>
              <div className="inline-flex gap-3">
                <span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 shadow-sm" aria-hidden>
                  <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                  Dispatched
                </span>

                <span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200 shadow-sm" aria-hidden>
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6] inline-block" />
                  Imported (R105)
                </span>

                <span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 shadow-sm" aria-hidden>
                  <span className="w-2 h-2 rounded-full bg-[#f97316] inline-block" />
                  Issued (W105)
                </span>

                <span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm" aria-hidden>
                  <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block" />
                  Packed (F105)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}