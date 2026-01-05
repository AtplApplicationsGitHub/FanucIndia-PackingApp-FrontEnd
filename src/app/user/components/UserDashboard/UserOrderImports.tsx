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
          cardBg: isDark ? "rgba(252, 211, 77, 0.05)" : "#fffbeb", // Light yellow / Dark subtle yellow
          cardBorder: "#fcd34d", // Yellow border
          iconBg: "#0ea5e9", // Bright Blue
          iconColor: "#ffffff",
          countColor: "#0ea5e9",
        };
      case "yesterday":
        return {
          cardBg: isDark ? "rgba(255, 255, 255, 0.02)" : "#f8fafc", // Very light gray/white / Dark subtle
          cardBorder: "transparent",
          iconBg: isDark ? "rgba(59, 130, 246, 0.2)" : "#dbeafe", // Light Blue
          iconColor: "#2563eb", // Blue
          countColor: theme.palette.text.primary,
        };
      default: // past
        return {
          cardBg: isDark ? "rgba(255, 255, 255, 0.02)" : "#f8fafc",
          cardBorder: "transparent",
          iconBg: isDark ? "rgba(148, 163, 184, 0.2)" : "#e2e8f0", // Light Gray
          iconColor: isDark ? "#94a3b8" : "#475569", // Slate
          countColor: theme.palette.text.primary,
        };
    }
  };

  return (
    <Paper
      elevation={0}
      component={motion.div}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
         p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 520 
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: "#dc2626", // Red matched from image
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          mb: 1,
        }}
      >
        ORDERS CREATED
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3, color: "text.secondary" }}>
        <Calendar size={18} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Last 5 Days
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {ordersData.map((item) => {
          const styles = getStyles(item.type);
          return (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderRadius: 3,
                backgroundColor: styles.cardBg,
                border: "1px solid",
                borderColor: styles.cardBorder,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* Avatar/Icon Circle */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: styles.iconBg,
                    color: styles.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                >
                  {item.abbr}
                </Box>

                {/* Date Labels */}
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: item.type === "today" ? "#0ea5e9" : "text.primary",
                    }}
                  >
                    <span style={{ color: item.type === "today" ? (isDark ? "inherit" : "#0369a1") : "inherit" }}>{item.label}</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                    {item.date}
                  </Typography>
                </Box>
              </Box>

              {/* Count */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: styles.countColor,
                }}
              >
                {item.count}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default UserOrderImports;
