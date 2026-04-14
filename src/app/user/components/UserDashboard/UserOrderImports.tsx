import React from "react";
import { useTheme } from "@mui/material";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useUserOrderImports } from "../../hooks/useUserOrderImports";

const UserOrderImports = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { data: ordersData, loading, error } = useUserOrderImports();

  if (error) {
    return (
      <div className="w-full h-full min-h-[520px] bg-white dark:bg-[#1F2933] rounded-xl border border-[#E5E7EB] dark:border-[#4B5563] shadow-sm p-6 flex items-center justify-center">
        <span className="text-red-500">Failed to load order data.</span>
      </div>
    );
  }

  if (loading && (!ordersData || ordersData.length === 0)) {
    return (
      <div className="w-full h-full min-h-[520px] bg-white dark:bg-[#1F2933] rounded-xl border border-[#E5E7EB] dark:border-[#4B5563] shadow-sm p-6 flex items-center justify-center">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  // Helper to get styles based on type
  const getStyles = (type: "today" | "yesterday" | "past") => {
    switch (type) {
      case "today":
        return {
          cardBg: isDark ? "rgba(234, 179, 8, 0.1)" : "#fefce8",
          cardBorder: isDark ? "#854d0e" : "#fcd34d",
          iconBg: isDark ? "#3B82F6" : "#3B82F6",
          iconColor: isDark ? "#ffffff" : "#ffffff",
          countColor: isDark ? "#3B82F6" : "#3B82F6",
          labelColor: isDark ? "#3B82F6" : "#3B82F6",
        };
      case "yesterday":
        return {
          cardBg: isDark ? "rgba(44, 53, 64, 0.3)" : "#F7F7F7",
          cardBorder: isDark ? "#4B5563" : "#E5E7EB",
          iconBg: isDark ? "rgba(59, 130, 246, 0.15)" : "#dbeafe",
          iconColor: isDark ? "#3B82F6" : "#3B82F6",
          countColor: "text.primary",
          labelColor: "text.primary",
        };
      default: // past
        return {
          cardBg: isDark ? "rgba(44, 53, 64, 0.3)" : "#F7F7F7",
          cardBorder: isDark ? "#4B5563" : "#E5E7EB",
          iconBg: isDark ? "rgba(148, 163, 184, 0.15)" : "#e2e8f0",
          iconColor: isDark ? "#94a3b8" : "#475569",
          countColor: "text.primary",
          labelColor: "text.primary",
        };
    }
  };
  if (!ordersData || ordersData.length === 0) {
    return (
      <div className="w-full h-full min-h-[520px] bg-white dark:bg-[#1F2933] rounded-xl border border-[#E5E7EB] dark:border-[#4B5563] shadow-sm p-6 flex items-center justify-center">
        <span className="text-gray-500">No orders found.</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[520px] bg-white dark:bg-[#1F2933] rounded-xl border border-[#E5E7EB] dark:border-[#4B5563] shadow-sm p-6 flex flex-col justify-between font-sans ">
      <div>
        <h2 className="text-base font-semibold uppercase text-[#D00000] dark:text-[#FF6B6B] mb-2">
          ORDERS CREATED
        </h2>

        <div className="flex items-center gap-2 mb-6 text-[#4B5563] dark:text-[#9CA3AF]">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Last 5 Days</span>
        </div>

        <div className="flex flex-col gap-3">
          {ordersData.map((item, index) => {
            const styles = getStyles(item.type as "today" | "yesterday" | "past");
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  backgroundColor: styles.cardBg,
                  borderColor: styles.cardBorder,
                }}
                className="flex items-center justify-between p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-sm hover:bg-[#F7F7F7] dark:hover:bg-[#2C3540]"              >
                <div className="flex items-center gap-3">
                  {/* Avatar/Icon Circle */}
                  <div
                    style={{
                      backgroundColor: styles.iconBg,
                      color: styles.iconColor,
                    }}
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shrink-0"
                  >
                    {item.label?.substring(0, 3) ?? "N/A"}
                  </div>

                  {/* Date Labels */}
                  <div>
                    <div
                      style={{ color: styles.labelColor }}
                      className="text-sm font-medium dark:text-gray-200"
                    >
                      {item.label}
                    </div>
                    <div className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                      {item.date}
                    </div>
                  </div>
                </div>

                {/* Count */}
                <div className="flex items-center gap-3">
                  {index === 0 && (
                    <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-pulse" />
                  )}
                  <div
                    style={{ color: styles.countColor === "text.primary" ? undefined : styles.countColor }}
                    className={`text-lg font-bold tabular-nums ${styles.countColor === "text.primary" ? "text-gray-900 dark:text-white" : ""}`}                  >
                    {item.count}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserOrderImports;
