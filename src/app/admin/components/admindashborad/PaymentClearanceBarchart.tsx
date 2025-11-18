"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { usePaymentClearanceBarchart } from "../hooks/usePaymentClearanceBarchart";

export default function PaymentClearanceByZone() {
  const { data, loading, error } = usePaymentClearanceBarchart();

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-md p-6">
        <div className="flex flex-col">
          <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Payment Clearance by Sales Zone
          </h3>
          <div className="w-full h-[340px] md:h-[420px] flex items-center justify-center">
            <div className="text-slate-500">Loading chart data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-md p-6">
        <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Payment Clearance by Sales Zone
        </h3>
        <div className="w-full h-[340px] md:h-[420px] flex items-center justify-center text-red-600">
          Error loading data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Payment Clearance by Sales Zone
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cleared vs Pending payments across sales zones
          </p>
        </div>

        {/* Header badges — updated to use Yes / No */}
        <div className="text-right">
          <span className="inline-block text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 mr-2">
            Yes
          </span>
          <span className="inline-block text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800">
            No
          </span>
        </div>
      </div>

      <div className="w-full h-[340px] md:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 24, left: 6, bottom: 12 }}
            barCategoryGap={24}
            className="font-medium"
          >
            <defs>
              <linearGradient id="gradYes" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34D399" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.95} />
              </linearGradient>

              <linearGradient id="gradNo" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#F97316" stopOpacity={0.95} />
              </linearGradient>

              <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.06" />
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#E6E9EE" />
            
            <XAxis
              dataKey="zone"
              axisLine={false}
              tickLine={false}
              padding={{ left: 12, right: 12 }}
              tick={{ fill: "#374151", fontSize: 13, fontWeight: 600 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              allowDecimals={false}
            />

            <Tooltip
              formatter={(value: number) => value}
              contentStyle={{
                borderRadius: 8,
                border: "0",
                boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
              }}
            />

            {/* Removed the bottom Legend as requested */}

            <Bar
              dataKey="cleared"
              name="Yes"            // renamed from Cleared -> Yes
              barSize={36}
              radius={[8, 8, 8, 8]}
              filter="url(#softShadow)"
            >
              {data.map((_, idx) => (
                <Cell key={`yes-${idx}`} fill="url(#gradYes)" />
              ))}
            </Bar>

            <Bar
              dataKey="pending"
              name="No"             // renamed from Pending -> No
              barSize={18}
              radius={[6, 6, 6, 6]}
            >
              {data.map((_, idx) => (
                <Cell key={`no-${idx}`} fill="url(#gradNo)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}