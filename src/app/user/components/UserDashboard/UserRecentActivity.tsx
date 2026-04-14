"use client";

import React from "react";
import { Box, Typography, Skeleton, Alert } from "@mui/material";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Package,
  CheckCircle,
  Warehouse,
  HelpCircle,
  MessageSquare,
  FileText
} from "lucide-react";

import { useUserRecentActivity } from "../../hooks/useUserRecentActivity";

function formatTimeAgo(timestamp: string) {
  if (!timestamp) return "";
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    return `${diffInDays} days ago`;
  } catch {
    return "";
  }
}

function getActivityConfig(type: string, text: string) {
  const t = (type || "").toUpperCase();
  const content = (text || "").toLowerCase();

  // Try to match specific keywords in text first for more granular icons
  if (content.includes("issue") || content.includes("error") || content.includes("failed")) {
    return {
      icon: <AlertCircle size={20} className="text-red-600 dark:text-red-400" />,
      bg: "bg-red-50 dark:bg-red-900/20",
    };
  }

  if (content.includes("packed")) {
    return {
      icon: <Package size={20} className="text-blue-600 dark:text-blue-400" />,
      bg: "bg-blue-50 dark:bg-blue-900/20",
    };
  }

  if (content.includes("dispatched") || content.includes("shipped")) {
    return {
      icon: <CheckCircle size={20} className="text-green-600 dark:text-green-400" />,
      bg: "bg-green-50 dark:bg-green-900/20",
    };
  }

  if (content.includes("fg location") || content.includes("storage")) {
    return {
      icon: <Warehouse size={20} className="text-purple-600 dark:text-purple-400" />,
      bg: "bg-purple-50 dark:bg-purple-900/20",
    };
  }

  // Fallback based on Type
  if (t === "ASSIGNMENT") {
    return {
      icon: <FileText size={20} className="text-indigo-600 dark:text-indigo-400" />,
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    };
  }

  if (t === "MESSAGE") {
    return {
      icon: <MessageSquare size={20} className="text-amber-600 dark:text-amber-400" />,
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
        <Alert severity="error">Failed to load activities. Please try again later.</Alert>
      </Box>
    );
  }

  const items = activities || [];

  return (
    <Box className={`bg-white dark:bg-[#1F2933] rounded-xl border border-[#E5E7EB] dark:border-[#4B5563] shadow-sm p-6 flex flex-col ${items.length === 0 ? '' : 'h-full min-h-[520px]'}`}>
      <div className="mb-8">
        <h2 className="text-base font-semibold uppercase tracking-wide text-[#D00000] dark:text-[#FF6B6B]">
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
            const { icon, bg } = getActivityConfig(item.type, item.text);
            const timeAgo = formatTimeAgo(item.timestamp);

            return (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.3) }}
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
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-snug mb-1">
                    {item.text}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                    {item.type || "Activity"} • {timeAgo}
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