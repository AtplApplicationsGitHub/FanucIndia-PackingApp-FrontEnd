"use client";

import React from "react";
import { AppBar, Toolbar, Typography, Box, useTheme } from "@mui/material";
import LogoutButton from "@/common/components/LogoutButton";
import { getGreeting } from "@/app/sales/components/utils/sales";

type Props = {
  userName: string;
};

export default function SalesDashboardHeader({ userName }: Props) {
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
          py: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {getGreeting()}
          {userName && (
            <>
              ,{" "}
              <Box
                component="span"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                }}
              >
                {userName}
              </Box>
            </>
          )}
        </Typography>

        <Box sx={{ mr: { xs: 0, md: 4 } }}>
          <LogoutButton
            sx={{ px: 6, py: 2 }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
