"use client";

import { useEffect, useState } from "react";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";
import { BarChart } from "@mui/x-charts/BarChart";
import { CircularProgress } from "@mui/material";

export default function PaymentMethodsChart({ selectedDate, displayDate }: { selectedDate: string, displayDate: string }) {
  const [chartData, setChartData] = useState<{ cleared: number; pending: number } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // FIX: Added state to handle view toggling, defaulting to 'table'
  const [viewType, setViewType] = useState<'table' | 'chart'>('table');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API.DASHBOARD.SALES_PAYMENT_CLEARANCE}?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          const zoneData = data.length > 0 ? data[0] : { paymentCleared: 0, paymentPending: 0 };
          setChartData({
            cleared: zoneData.paymentCleared,
            pending: zoneData.paymentPending,
          });
        }
      } catch (error) {
        console.error("Error loading payment clearance", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  return (
    <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563] h-full flex flex-col min-h-[350px]">
      
      {/* HEADER WITH TOGGLE BUTTONS */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-semibold text-[#D00000] dark:text-[#FF6B6B] uppercase">
          Payment Clearance <span className="text-sm font-normal text-gray-500 ml-1">({displayDate})</span>
        </h3>
        
        {/* Toggle Switch */}
        <div className="flex items-center bg-[#F7F7F7] dark:bg-[#2C3540] rounded-lg p-1 border border-[#E5E7EB] dark:border-[#4B5563]">
          <button
            onClick={() => setViewType('table')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              viewType === 'table'
                ? "bg-white dark:bg-[#1F2933] text-[#D00000] dark:text-[#FF6B6B] shadow-sm"
                : "text-[#4B5563] dark:text-[#E5E7EB] hover:text-[#1F2933] dark:hover:text-white"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewType('chart')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              viewType === 'chart'
                ? "bg-white dark:bg-[#1F2933] text-[#D00000] dark:text-[#FF6B6B] shadow-sm"
                : "text-[#4B5563] dark:text-[#E5E7EB] hover:text-[#1F2933] dark:hover:text-white"
            }`}
          >
            Chart
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 relative flex justify-center items-center w-full min-h-[250px]">
        {loading ? (
          <CircularProgress size={30} />
        ) : !chartData ? (
          <span className="text-gray-500">No data available</span>
        ) : viewType === 'chart' ? (
          <BarChart
            xAxis={[{ scaleType: "band", data: ["Payment Status"] }]}
            series={[
              { data: [chartData.cleared], label: "Cleared", color: "#22C55E" },
              { data: [chartData.pending], label: "Pending", color: "#EF4444" },
            ]}
            slotProps={{
              legend: {
                position: { vertical: "bottom", horizontal: "center" },
              },
            }}
            margin={{ top: 10, bottom: 50, left: 40, right: 10 }}
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-center">
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB] dark:border-[#4B5563] shadow-sm">
              <table className="min-w-full divide-y divide-[#E5E7EB] dark:divide-[#4B5563]">
                <thead className="bg-[#F7F7F7] dark:bg-[#2C3540]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-wider">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#1F2933] divide-y divide-[#E5E7EB] dark:divide-[#4B5563]">
                  <tr className="hover:bg-gray-50 dark:hover:bg-[#2C3540]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#22C55E]">
                      Cleared
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#1F2933] dark:text-white font-bold">
                      {chartData.cleared.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-[#2C3540]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#EF4444]">
                      Pending
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#1F2933] dark:text-white font-bold">
                      {chartData.pending.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-[#F7F7F7] dark:bg-[#2C3540]/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1F2933] dark:text-[#E5E7EB]">
                      Total Orders
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#1F2933] dark:text-[#E5E7EB] font-bold">
                      {(chartData.cleared + chartData.pending).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}