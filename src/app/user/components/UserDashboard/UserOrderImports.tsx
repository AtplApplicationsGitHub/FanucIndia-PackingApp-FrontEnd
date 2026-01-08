import React from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useUserOrderImports } from "../../hooks/useUserOrderImports";

const UserOrderImports = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { data: ordersData } = useUserOrderImports();

  // Helper to get styles based on type
  const getStyles = (type: string) => {
    switch (type) {
      case "today":
        return {
          cardBg: isDark ? "rgba(234, 179, 8, 0.1)" : "#fffbeb", // Yellow tint
          cardBorder: isDark ? "rgba(234, 179, 8, 0.3)" : "#fcd34d",
          iconBg: isDark ? "rgba(14, 165, 233, 0.2)" : "#0ea5e9", // Blue tint
          iconColor: isDark ? "#38bdf8" : "#ffffff",
          countColor: isDark ? "#38bdf8" : "#0ea5e9",
          labelColor: isDark ? "#38bdf8" : "#0369a1",
        };
      case "yesterday":
        return {
          cardBg: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
          cardBorder: "transparent",
          iconBg: isDark ? "rgba(59, 130, 246, 0.15)" : "#dbeafe", // Blue tint
          iconColor: isDark ? "#60a5fa" : "#2563eb",
          countColor: "text.primary",
          labelColor: "text.primary",
        };
      default: // past
        return {
          cardBg: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
          cardBorder: "transparent",
          iconBg: isDark ? "rgba(148, 163, 184, 0.15)" : "#e2e8f0", // Gray tint
          iconColor: isDark ? "#94a3b8" : "#475569",
          countColor: "text.primary",
          labelColor: "text.primary",
        };
    }
  };

  return (
    <div className="w-full h-full min-h-[520px] bg-white dark:bg-[#1F2933] rounded-xl border border-[#E5E7EB] dark:border-[#4B5563] shadow-sm p-6 flex flex-col justify-between font-sans transition-all">
      <div>
        <h2 className="text-lg font-semibold uppercase tracking-wide text-[#D00000] dark:text-[#FF6B6B] mb-2">
          ORDERS CREATED
        </h2>

        <div className="flex items-center gap-2 mb-6 text-[#4B5563] dark:text-[#9CA3AF]">
          <Calendar size={18} />
          <span className="text-sm font-medium">Last 5 Days</span>
        </div>

        <div className="flex flex-col gap-3">
          {ordersData.map((item, index) => {
            const styles = getStyles(item.type);
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
                className="flex items-center justify-between p-3 rounded-xl border transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar/Icon Circle */}
                  <div
                    style={{
                      backgroundColor: styles.iconBg,
                      color: styles.iconColor,
                    }}
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                  >
                    {item.abbr}
                  </div>

                  {/* Date Labels */}
                  <div>
                    <div
                      style={{ color: styles.labelColor }}
                      className="text-base font-semibold dark:text-gray-200"
                    >
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.date}
                    </div>
                  </div>
                </div>

                {/* Count */}
                <div
                  style={{ color: styles.countColor === "text.primary" ? undefined : styles.countColor }}
                  className={`text-xl font-bold ${styles.countColor === "text.primary" ? "text-gray-900 dark:text-white" : ""}`}
                >
                  {item.count}
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
