"use client";

import React from "react";
import { Box, Typography, Skeleton, Alert, Badge, IconButton, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Package,
  CheckCircle,
  AlertTriangle,
  Warehouse,
  Truck,
  HelpCircle,
  MessageSquare,
  Bell,
  MoreHorizontal
} from "lucide-react";

// Import the new hook
import { useUserRecentActivity } from "../../hooks/useUserRecentActivity";

/**
 * Custom styling helper for the User Dashboard version of Recent Activity.
 * We ignore the 'config' coming from the hook and use our own mapping.
 */
function getActivityConfig(status: string) {
  const s = (status || "").toLowerCase().trim();

  // 1. Issue reported (Red)
  if (s.includes("issue reported") || s.includes("error")) {
    return {
      icon: <AlertCircle size={20} className="text-red-600" />,
      bg: "bg-red-50",
    };
  }

  // 2. Packed (Blue/Indigo)
  if (s.includes("packed")) {
    return {
      icon: <Package size={20} className="text-blue-600" />,
      bg: "bg-blue-50",
    };
  }

  // 3. Dispatched (Green)
  if (s.includes("dispatched") || s.includes("shipped")) {
    return {
      icon: <CheckCircle size={20} className="text-green-600" />,
      bg: "bg-green-50",
    };
  }

  // 4. Moved to FG location (Purple)
  if (s.includes("fg location") || s.includes("storage")) {
    return {
      icon: <Warehouse size={20} className="text-purple-600" />,
      bg: "bg-purple-50",
    };
  }

  // 5. Issue found (Yellow)
  if (s.includes("issue found") || s.includes("warning")) {
    return {
      icon: <AlertTriangle size={20} className="text-amber-600" />, // Amber/Yellow
      bg: "bg-amber-50",
    };
  }

  // Fallback
  return {
    icon: <HelpCircle size={20} className="text-gray-500" />,
    bg: "bg-gray-50",
  };
}

export default function UserRecentActivity() {
  const { activities, loading, error } = useUserRecentActivity();

  if (loading) {
    return (
      <Box className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
        <Typography variant="h6" className="font-bold mb-4 text-gray-800">
          Recent Activities
        </Typography>
        {[...Array(4)].map((_, i) => (
          <Box key={i} className="flex gap-4 mb-4">
            <Skeleton variant="circular" width={40} height={40} />
            <Box className="flex-1">
              <Skeleton width="60%" />
              <Skeleton width="40%" height={15} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
        <Alert severity="error">Failed to load activities: {error}</Alert>
      </Box>
    );
  }

  const items = activities || [];

  return (
    <Box className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-full flex flex-col">
      <Typography variant="h6" className="font-bold text-gray-800 mb-6">
        Recent Activities
      </Typography>

      <div className="flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
        {items.length === 0 ? (
          <Typography className="text-gray-500 text-center py-4">
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
                  <span className="text-sm font-bold text-gray-800 leading-none mb-1">
                    {item.salesOrderNumber}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
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

