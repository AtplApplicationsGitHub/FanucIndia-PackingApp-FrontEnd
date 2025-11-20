// components/charts/OrderStatusByZone.tsx
'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Table, BarChart3 } from 'lucide-react';
import { useOrderZoneBarChart, ZoneStatus } from '../hooks/useOrderzoneBarchart';

export default function OrderStatusByZone() {
  const { data, loading, error, refetch } = useOrderZoneBarChart();
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // Stable color palette
  const COLORS = {
    assigned: '#3B82F6',  // Blue
    issued: '#F97316',    // Orange
    packed: '#8B5CF6',    // Purple
    dispatched: '#10B981', // Green
  };

  // Transform API data
  const chartData = (data || []).map((item: ZoneStatus) => ({
    zone: item.zoneName,
    assigned: item.r105Count,
    issued: item.w105Count,
    packed: item.f105Count,
    dispatched: item.dispatchedCount,
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 animate-spin" />
            Loading order status by zone...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading data: {error}</p>
          <button
            onClick={refetch}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-300 select-none h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 uppercase tracking-wider">
            Order Status by Sales Zone
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time counts per zone — Assigned, Issued, Packed, Dispatched
          </p>
        </div>

        {/* Clean Toggle Button - No selected style, no yellow */}
        <button
          onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          {viewMode === 'chart' ? (
            <>
              <Table className="w-5 h-5" />
              <span>Table View</span>
            </>
          ) : (
            <>
              <BarChart3 className="w-5 h-5" />
              <span>Chart View</span>
            </>
          )}
        </button>
      </div>

      {/* Chart View */}
      {viewMode === 'chart' ? (
        <>
          <div className="h-[450px] -mx-6 -mb-6" style={{ userSelect: "none" }} >
            <ResponsiveContainer width="100%" height="130%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="" />
                <XAxis
                  dataKey="zone"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fill: '#374151', fontSize: 13, fontWeight: 600 }}
                  interval={0}
                />
                <YAxis tick={{ fill: '#374151', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: 'none',
                    borderRadius: 8,
                    color: '#e5e7eb',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  }}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                <Bar dataKey="assigned" fill={COLORS.assigned} name="Assigned (R105)" radius={[6, 6, 0, 0]} barSize={28} />
                <Bar dataKey="issued" fill={COLORS.issued} name="Issued (W105)" radius={[6, 6, 0, 0]} barSize={28} />
                <Bar dataKey="packed" fill={COLORS.packed} name="Packed (F105)" radius={[6, 6, 0, 0]} barSize={28} />
                <Bar dataKey="dispatched" fill={COLORS.dispatched} name="Dispatched" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Badges - Centered */}
          <div className="mt-8 flex justify-center">
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                <span className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                Assigned (R105)
              </span>
              <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
                <span className="w-3 h-3 rounded-full bg-[#F97316]" />
                Issued (W105)
              </span>
              <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                <span className="w-3 h-3 rounded-full bg-[#8B5CF6]" />
                Packed (F105)
              </span>
              <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-800 border border-green-200">
                <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                Dispatched
              </span>
            </div>
          </div>
        </>
      ) : (
        /* Table View */
        <div className="overflow-x-auto -mx-6 -mb-6 mt-4">
          <table className="w-full text-sm border-t border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider">Zone</th>
                <th className="px-6 py-4 text-center font-semibold" style={{ color: COLORS.assigned }}>Assigned (R105)</th>
                <th className="px-6 py-4 text-center font-semibold" style={{ color: COLORS.issued }}>Issued (W105)</th>
                <th className="px-6 py-4 text-center font-semibold" style={{ color: COLORS.packed }}>Packed (F105)</th>
                <th className="px-6 py-4 text-center font-semibold" style={{ color: COLORS.dispatched }}>Dispatched</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {chartData.map((row) => (
                <tr key={row.zone} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.zone}</td>
                  <td className="px-6 py-4 text-center font-bold" style={{ color: COLORS.assigned }}>{row.assigned}</td>
                  <td className="px-6 py-4 text-center font-bold" style={{ color: COLORS.issued }}>{row.issued}</td>
                  <td className="px-6 py-4 text-center font-bold" style={{ color: COLORS.packed }}>{row.packed}</td>
                  <td className="px-6 py-4 text-center font-bold" style={{ color: COLORS.dispatched }}>{row.dispatched}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}