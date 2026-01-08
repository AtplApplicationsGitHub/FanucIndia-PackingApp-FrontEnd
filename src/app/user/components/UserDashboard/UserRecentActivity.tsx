"use client";

import React from "react";
import { Box, Typography, Skeleton, Alert } from "@mui/material";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Package,
  CheckCircle,
  AlertTriangle,
  Warehouse,
  HelpCircle,
} from "lucide-react";

import { useUserRecentActivity } from "../../hooks/useUserRecentActivity";

function getActivityConfig(status: string) {
  const s = (status || "").toLowerCase().trim();

  if (s.includes("issue reported") || s.includes("error")) {
    return {
      icon: <AlertCircle size={20} className="text-red-600 dark:text-red-400" />,
      bg: "bg-red-50 dark:bg-red-900/20",
    };
  }

  if (s.includes("packed")) {
    return {
      icon: <Package size={20} className="text-blue-600 dark:text-blue-400" />,
      bg: "bg-blue-50 dark:bg-blue-900/20",
    };
  }

  if (s.includes("dispatched") || s.includes("shipped")) {
    return {
      icon: <CheckCircle size={20} className="text-green-600 dark:text-green-400" />,
      bg: "bg-green-50 dark:bg-green-900/20",
    };
  }

  if (s.includes("fg location") || s.includes("storage")) {
    return {
      icon: <Warehouse size={20} className="text-purple-600 dark:text-purple-400" />,
      bg: "bg-purple-50 dark:bg-purple-900/20",
    };
  }

  if (s.includes("issue found") || s.includes("warning")) {
    return {
      icon: <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />, // Amber/Yellow
      bg: "bg-amber-50 dark:bg-amber-900/20",
    };
  }

  return {
    icon: <HelpCircle size={20} className="text-gray-500 dark:text-gray-400" />,
    bg: "bg-gray-50 dark:bg-gray-700/50",
  };
}

export default function UserRecentActivity() {
  const { activities, loading, error } = useUserRecentActivity();

  if (loading) {
    return (
      <Box className="bg-white dark:bg-[#1F2933] rounded-xl border border-[#E5E7EB] dark:border-[#4B5563] shadow-sm p-6 overflow-hidden min-h-[400px]">
        <Typography variant="h6" className="font-bold mb-4 text-[#D00000] dark:text-[#FF6B6B] uppercase text-lg tracking-wide">
          Recent Activities
        </Typography>
        {[...Array(5)].map((_, i) => (
          <Box key={i} className="flex gap-4 mb-4">
            <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'text.secondary', opacity: 0.1 }} />
            <Box className="flex-1">
              <Skeleton width="60%" sx={{ bgcolor: 'text.secondary', opacity: 0.1 }} />
              <Skeleton width="40%" height={15} sx={{ bgcolor: 'text.secondary', opacity: 0.1 }} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="bg-white dark:bg-[#1F2933] rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm p-6">
        <Alert severity="error">Failed to load activities: {error}</Alert>
      </Box>
    );
  }

  const items = activities || [];

  return (
    <Box className="bg-white dark:bg-[#1F2933] rounded-xl border border-[#E5E7EB] dark:border-[#4B5563] shadow-sm p-6 h-full flex flex-col min-h-[520px]">
      <div className="mb-5">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-[#D00000] dark:text-[#FF6B6B]">
          Recent Activities
        </h2>
        <p className="mt-1 text-sm text-[#4B5563] dark:text-[#9CA3AF]">
          Latest updates on your orders
        </p>
      </div>

      <div className="flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar flex-1">
        {items.length === 0 ? (
          <Typography className="text-gray-500 dark:text-gray-400 text-center py-4">
            No recent activity found.
          </Typography>
        ) : (
          items.map((item, index) => {
            const { icon, bg } = getActivityConfig(item.status);
            // Unique key combining SO number + timestamp + index
            const key = `${item.salesOrderNumber}-${item.activityTimestamp}-${index}`;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 group"
              >
                {/* Icon Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg} transition-transform group-hover:scale-110`}
                >
                  {icon}
                </div>

                {/* Text Content */}
                <div className="flex flex-col pt-0.5">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none mb-1">
                    {item.salesOrderNumber}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {item.status} • {item.timeAgo}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Box>
  );
}