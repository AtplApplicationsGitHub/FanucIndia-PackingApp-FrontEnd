"use client";

import React from "react";
import { AppBar, Toolbar, Typography, Box, useTheme, Button } from "@mui/material";
import LogoutButton from "@/common/components/LogoutButton";
import { getGreeting } from "@/app/sales/components/utils/sales";
import { SalesDashboardView } from "@/app/sales/components/hooks/useSalesDashboard";
import { Home, ClipboardList } from "lucide-react";

type Props = {
  userName: string;
  view: SalesDashboardView;
  setView: (view: SalesDashboardView) => void;
};

const FANUC_BLUE = "#3b579d"; // Matching other headers

const menuItems = [
  { label: "HOME", icon: <Home className="mr-2 h-4 w-4" />, value: "home" },
  {
    label: "ORDERS",
    icon: <ClipboardList className="mr-2 h-4 w-4" />,
    value: "orders",
  },
];

export default function SalesDashboardHeader({ userName, view, setView }: Props) {
  const theme = useTheme();

  return (
    <AppBar
      position="static"
      color="default"
      elevation={1}
      sx={{
        bgcolor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          px: { xs: 2, md: 4 },
          pr: { xs: 8, md: 10 },
          py: 1, // Reduced padding
          minHeight: 64, // Standard height
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
          {getGreeting()}
          {userName && (
            <>
              ,{" "}
              <Box
                component="span"
                sx={{
                  color: FANUC_BLUE, // Use consistent blue
                  fontWeight: 600,
                }}
              >
                {userName}
              </Box>
            </>
          )}
        </Typography>

        {/* View Buttons */}
        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "center", gap: 2, px: 4 }}>
          {menuItems.map((item) => {
            const isSelected = view === item.value;
            return (
              <Button
                key={item.value}
                disableRipple
                variant="text"
                startIcon={item.icon}
                onClick={() => setView(item.value as SalesDashboardView)}
                sx={{
                  borderRadius: 0,
                  px: 2.5,
                  py: 1.5,
                  minWidth: 120,
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected
                    ? FANUC_BLUE
                    : theme.palette.text.secondary,
                  bgcolor: "transparent",
                  boxShadow: "none",
                  outline: "none",
                  border: "none",
                  borderBottom: isSelected
                    ? `3px solid ${FANUC_BLUE}`
                    : "3px solid transparent",
                  "&:hover": {
                    color: FANUC_BLUE,
                    background: theme.palette.action.hover,
                    textDecoration: "none",
                    boxShadow: "none",
                  },
                  "&:focus": {
                    outline: "none",
                  },
                  textTransform: "none",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ ml: 2, whiteSpace: "nowrap" }}>
          <LogoutButton
            sx={{ px: { xs: 3, md: 4 }, py: 1.5 }} // Adjusted padding
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}