// src/app/sales/salesdashboard/RecentActivity.tsx
"use client";

import React from "react";
import { Box, Typography, Skeleton, Alert } from "@mui/material";
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

/**
 * Adjust this interface if your hook returns additional/different fields.
 */
interface RecentActivityItem {
  salesOrderNumber?: string;
  activityTimestamp?: string | number;
  config?: {
    label?: string | null;
  };
  timeAgo?: string;
  // add any other fields your hook actually returns
}

function getIconByLabel(label?: string) {
  const l = (label ?? "").toLowerCase().trim();

  if (l.includes("dispatched") || l.includes("ship"))
    return <Truck size={18} className="text-blue-600" />;

  if (l.includes("ready for dispatch"))
    return <ClipboardCheck size={18} className="text-teal-600" />;

  if (l.includes("packed") || l.includes("packing"))
    return <Package size={18} className="text-orange-600" />;

  if (l.includes("issued") || l.includes("issue"))
    return <ArrowUpRight size={18} className="text-purple-600" />;

  if (l.includes("assigned") || l.includes("assign"))
    return <User size={18} className="text-yellow-700" />;

  if (l.includes("delivered") || l.includes("delivery"))
    return <CheckCircle size={18} className="text-green-600" />;

  if (l.includes("created"))
    return <Calendar size={18} className="text-indigo-600" />;

  // fallback
  return <HelpCircle size={18} className="text-gray-600" />;
}

function getPillClasses(label?: string) {
  const l = (label ?? "").toLowerCase().trim();

  if (l.includes("dispatched") || l.includes("ship"))
    return "bg-blue-50 border border-blue-200 text-blue-700";

  // ←←← Fixed “Ready For Dispatch” (case-insensitive + trimmed)
  if (l.includes("ready for dispatch"))
    return "bg-teal-50 border border-teal-200 text-teal-800";

  if (l.includes("in progress") || l.includes("inprogress") || l.includes("progress"))
    return "bg-sky-50 border border-sky-200 text-sky-700";

  if (l.includes("packed") || l.includes("packing"))
    return "bg-orange-50 border border-orange-200 text-orange-700";

  if (l.includes("issued") || l.includes("issue"))
    return "bg-purple-50 border border-purple-200 text-purple-700";

  if (l.includes("assigned") || l.includes("assign"))
    return "bg-yellow-50 border border-yellow-200 text-yellow-800";

  if (l.includes("delivered") || l.includes("delivery"))
    return "bg-green-50 border border-green-200 text-green-700";

  if (l.includes("overdue") || l.includes("late"))
    return "bg-rose-50 border border-rose-200 text-rose-700";

  // fallback neutral pill
  return "bg-gray-50 border border-gray-200 text-gray-700";
}

export default function RecentActivity(): React.ReactElement {
  const { activities, loading, error } = useRecentActivity() as {
    activities?: RecentActivityItem[];
    loading: boolean;
    error?: string | null;
  };

  if (loading) {
    return (
      <Box className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <Typography
          variant="body2"
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "secondary.main",
          }}
        >
          Recent Activity
        </Typography>

        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={64} sx={{ mt: i === 0 ? 2 : 1.5 }} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const items = activities ?? [];

  return (
    <Box className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <Typography
        variant="body2"
        sx={{
          fontSize: "1rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "secondary.main",
        }}
      >
        Recent Activity
      </Typography>

      <Box className="mt-4 divide-y divide-gray-100">
        {items.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={4}>
            No recent activity
          </Typography>
        ) : (
          items.map((activity, index) => {
            const rawLabel = activity?.config?.label ?? "activity";
            const label = String(rawLabel);
            const iconNode = getIconByLabel(label);
            const pillClasses = getPillClasses(label);

            const key = `${activity.salesOrderNumber ?? "unknown"}-${activity.activityTimestamp ?? index}`;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="py-4 flex items-center justify-between group hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200"
              >
                <Box className="flex items-center gap-3">
                  <Box
                    className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-gray-100 shadow-sm transition-all duration-300 group-hover:scale-105"
                    aria-hidden
                  >
                    <span className="flex items-center justify-center">
                      {iconNode}
                    </span>
                  </Box>

                  <Box className="flex flex-col">
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      className="text-gray-900"
                    >
                      {activity.salesOrderNumber
                        ? `Order : ${activity.salesOrderNumber}`
                        : "Order"}
                    </Typography>

                    <div className="mt-2 flex items-center gap-2">
                      {/* status pill */}
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${pillClasses}`}
                      >
                        <span className="capitalize">
                          {label.replace(/_/g, " ")}
                        </span>
                      </span>

                      {/* relative time / meta */}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        className="mt-0"
                      >
                        {activity.timeAgo ?? ""}
                      </Typography>
                    </div>
                  </Box>
                </Box>
              </motion.div>
            );
          })
        )}
      </Box>
    </Box>
  );
}
