"use client";

import React from "react";
import { Skeleton, Alert } from "@mui/material";
import { motion } from "framer-motion";
import {
  Truck,
  Package,
  CheckCircle,
  User,
  HelpCircle,
  Calendar,
  ClipboardCheck,
  ArrowUpRight,
} from "lucide-react";
import { useRecentActivity } from "../hooks/RecentActivity";

interface RecentActivityItem {
  salesOrderNumber?: string;
  activityTimestamp?: string | number;
  config?: {
    label?: string | null;
  };
  timeAgo?: string;
  
}

function getIconByLabel(label?: string) {
  const l = (label ?? "").toLowerCase().trim();

  if (l.includes("dispatched") || l.includes("ship"))
    return <Truck size={18} className="text-blue-600 dark:text-blue-400" />;

  if (l.includes("ready for dispatch"))
    return <ClipboardCheck size={18} className="text-teal-600 dark:text-teal-400" />;

  if (l.includes("packed") || l.includes("packing"))
    return <Package size={18} className="text-orange-600 dark:text-orange-400" />;

  if (l.includes("issued") || l.includes("issue"))
    return <ArrowUpRight size={18} className="text-purple-600 dark:text-purple-400" />;

  if (l.includes("assigned") || l.includes("assign"))
    return <User size={18} className="text-yellow-700 dark:text-yellow-400" />;

  if (l.includes("delivered") || l.includes("delivery"))
    return <CheckCircle size={18} className="text-green-600 dark:text-green-400" />;

  if (l.includes("created"))
    return <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />;

  // fallback
  return <HelpCircle size={18} className="text-gray-600 dark:text-gray-400" />;
}

function getPillClasses(label?: string) {
  const l = (label ?? "").toLowerCase().trim();

  if (l.includes("dispatched") || l.includes("ship"))
    return "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300";

  // ←←← Fixed “Ready For Dispatch” (case-insensitive + trimmed)
  if (l.includes("ready for dispatch"))
    return "bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300";

  if (l.includes("in progress") || l.includes("inprogress") || l.includes("progress"))
    return "bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300";

  if (l.includes("packed") || l.includes("packing"))
    return "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300";

  if (l.includes("issued") || l.includes("issue"))
    return "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300";

  if (l.includes("assigned") || l.includes("assign"))
    return "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300";

  if (l.includes("delivered") || l.includes("delivery"))
    return "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300";

  if (l.includes("overdue") || l.includes("late"))
    return "bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300";

  // fallback neutral pill
  return "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300";
}

export default function RecentActivity(): React.ReactElement {
  const { activities, loading, error } = useRecentActivity() as {
    activities?: RecentActivityItem[];
    loading: boolean;
    error?: string | null;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1F2933] rounded-xl border border-[#E5E7EB] dark:border-[#4B5563] shadow-sm p-6 w-full h-full font-sans">
        <p className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
          Recent Activity
        </p>

        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={64} sx={{ mt: i === 0 ? 2 : 1.5 }} className="dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#1F2933] rounded-xl border border-red-200 dark:border-red-800 shadow-sm p-6 w-full h-full font-sans">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  const items = activities ?? [];

  return (
    <div className="bg-white dark:bg-[#1F2933] rounded-xl border border-[#E5E7EB] dark:border-[#4B5563] shadow-sm p-6 w-full h-full font-sans transition-all">
      <p className="text-base uppercase font-semibold text-[#D00000] dark:text-[#FF6B6B]">
        Recent Activity
      </p>

      <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
        {items.length === 0 ? (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">
            No recent activity
          </p>
        ) : (
          items.map((activity, index) => {
            const rawLabel = activity?.config?.label ?? "activity";
            const label = String(rawLabel);
            const iconNode = getIconByLabel(label);
            const pillClasses = getPillClasses(label);

            const key = `${activity.salesOrderNumber ?? "unknown"}-${activity.activityTimestamp ?? "ts"}-${index}`;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="py-4 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-[#2C3540] rounded-lg px-2 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white dark:bg-[#2C3540] border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 group-hover:scale-105"
                    aria-hidden
                  >
                    <span className="flex items-center justify-center">
                      {iconNode}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {activity.salesOrderNumber
                        ? `Order : ${activity.salesOrderNumber}`
                        : "Order"}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      {/* status pill */}
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${pillClasses}`}
                      >
                        <span className="capitalize">
                          {label.replace(/_/g, " ")}
                        </span>
                      </span>

                      {/* relative time / meta */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0">
                        {activity.timeAgo ?? ""}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
