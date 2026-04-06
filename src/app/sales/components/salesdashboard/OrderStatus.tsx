"use client";

import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { CircularProgress } from "@mui/material";
import { API, fetchWithAuth } from "../../../../common/lib/endpoints";

export default function OrderStatus({ selectedDate, displayDate }: { selectedDate: string, displayDate: string }) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API.DASHBOARD.SALES_OVERALL_STATUS}?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          const totalOrders = data.totalOrders || 0;
          setTotal(totalOrders);
          
          // Map backend data to MUI PieChart format
          const rawData = [
            { id: 0, value: data.toBeIssuedCount || 0, label: "To be Issued", color: "#6B7280" },
            { id: 1, value: data.r105Count || 0, label: "R105", color: "#EAB308" },
            { id: 2, value: data.w105Count || 0, label: "W105", color: "#A855F7" },
            { id: 3, value: data.f105Count || 0, label: "F105", color: "#3B82F6" },
            { id: 4, value: data.dispatchedCount || 0, label: "Dispatched", color: "#22C55E" },
          ];

          // FIX: Filter out 0 values so MUI PieChart renders properly
          setChartData(rawData.filter((item) => item.value > 0));
        }
      } catch (error) {
        console.error("Error loading order status", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  const hasData = total > 0;

  return (
    <div className="bg-white dark:bg-[#1F2933] rounded-xl shadow-sm p-6 border border-[#E5E7EB] dark:border-[#4B5563] h-full flex flex-col min-h-[350px]">
      <h3 className="text-base font-semibold text-[#D00000] dark:text-[#FF6B6B] uppercase mb-6">
        Order Status Distribution ({displayDate})
      </h3>
      
      <div className="flex-1 min-h-[280px] w-full relative flex items-center justify-center">
        {loading ? (
          <CircularProgress size={30} />
        ) : hasData && chartData.length > 0 ? (
          <PieChart
            series={[
              {
                data: chartData,
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
                valueFormatter: (item) => {
                  const value = item.value ?? 0;
                  const percentage = total > 0 ? (value / total) * 100 : 0;
                  return `${value.toLocaleString()} orders (${percentage.toFixed(1)}%)`;
                },
                innerRadius: 0,
                paddingAngle: 0,
                cornerRadius: 0,
              },
            ]}
            height={280}
            margin={{ top: 20, bottom: 20, left: 20, right: 20 }}
            className="text-[#1F2933] dark:text-[#F7F7F7]"
            sx={{
              "& .MuiChartsLegend-label": {
                fill: "currentColor !important",
              },
            }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#4B5563] dark:text-[#E5E7EB]">
            <span className="text-lg font-medium">No Orders</span>
            <span className="text-sm text-gray-400 mt-1">Found for {displayDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}