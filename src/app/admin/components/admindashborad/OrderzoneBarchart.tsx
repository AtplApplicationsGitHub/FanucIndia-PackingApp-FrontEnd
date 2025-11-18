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

  // Transform API data to match chart expectations
  const chartData = (data || []).map((item: ZoneStatus) => ({
    zone: item.zoneName,
    imported: item.r105Count,
    issued: item.w105Count,
    packed: item.f105Count,
    dispatched: item.dispatchedCount,
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 animate-spin" />
            Loading order status by zone...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-red-600 text-center">
          <p>Error loading data: {error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Order Status by Sales Zone
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time counts per zone — Imported, Issued, Packed, Dispatched
          </p>
        </div>

        {/* Mini header badges */}
        <div className="flex justify-end items-center mb-4">
          <button
            onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
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
      </div>




      {viewMode === 'chart' ? (
        <>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="130%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 120 }} // extra bottom space for badges & rotated labels
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ee" />
                <XAxis
                  dataKey="zone"
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                    boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
                  }}
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                />

                {/* Removed the built-in Legend to prevent duplicated labels */}
                {/* <Legend ... /> */}

                <Bar dataKey="imported" fill="#3b82f6" name="Imported (R105)" radius={[6, 6, 0, 0]} barSize={28} />
                <Bar dataKey="issued" fill="#f97316" name="Issued (W105)" radius={[6, 6, 0, 0]} barSize={28} />
                <Bar dataKey="packed" fill="#10b981" name="Packed (F105)" radius={[6, 6, 0, 0]} barSize={28} />
                <Bar dataKey="dispatched" fill="#9333ea" name="Dispatched" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Centered chips / badges below the chart (only place where labels appear) */}
          <div className="w-full mt-4 flex items-center justify-center" aria-hidden={false}>
            <div className="inline-flex gap-3 flex-wrap justify-center">
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
        </>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-6 py-4 text-center font-medium text-blue-600 uppercase tracking-wider">
                  Imported (R105)
                </th>
                <th className="px-6 py-4 text-center font-medium text-orange-600 uppercase tracking-wider">
                  Issued (W105)
                </th>
                <th className="px-6 py-4 text-center font-medium text-green-600 uppercase tracking-wider">
                  Packed (F105)
                </th>
                <th className="px-6 py-4 text-center font-medium text-purple-600 uppercase tracking-wider">
                  Dispatched
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartData.map((row) => (
                <tr key={row.zone} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.zone}</td>
                  <td className="px-6 py-4 text-center text-blue-600 font-bold">{row.imported}</td>
                  <td className="px-6 py-4 text-center text-orange-600 font-bold">{row.issued}</td>
                  <td className="px-6 py-4 text-center text-green-600 font-bold">{row.packed}</td>
                  <td className="px-6 py-4 text-center text-purple-600 font-bold">{row.dispatched}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
