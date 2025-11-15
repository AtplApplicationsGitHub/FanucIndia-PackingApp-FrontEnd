"use client";

import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { Box, Typography, useTheme, Menu, MenuItem , } from "@mui/material";
import {
  BarChart3 ,
  ClipboardList,
  Database,
  Users,
  Truck,
  Grid,
  Search,
  ChevronDown,
} from "lucide-react";
import LogoutButton from "@/common/components/LogoutButton";
import { getGreeting } from "@/app/sales/components/utils/sales";
import { useRouter, usePathname } from "next/navigation";

const FANUC_BLUE = "#3b579d";

export type ViewType =
  | "home"
  | "orders"
  | "master"
  | "manage"
  | "dispatch"
  | "fg_dashboard";

type Props = {
  userName: string;
  view: ViewType;
  setView: React.Dispatch<React.SetStateAction<ViewType>>;
};

const allMenuItems = [
  { label: "DASHBOARD", icon: <BarChart3  className="mr-2 h-4 w-4" />, value: "home" },
  {
    label: "ORDER LIST",
    icon: <ClipboardList className="mr-2 h-4 w-4" />,
    value: "orders",
  },
  {
    label: "SO SEARCH",
    icon: <Search className="mr-2 h-4 w-4" />,
    value: "so_search",
  },
  {
    label: "DISPATCH",
    icon: <Truck className="mr-2 h-4 w-4" />,
    value: "dispatch",
  },
  {
    label: "FG DASHBOARD",
    icon: <Grid className="mr-2 h-4 w-4" />,
    value: "fg_dashboard",
  },
  {
    label: "MASTER",
    icon: <Database className="mr-2 h-4 w-4" />,
    value: "master",
  },
  {
    label: "MANAGE",
    icon: <Users className="mr-2 h-4 w-4" />,
    value: "manage",
  },
];

const MAX_VISIBLE_ITEMS = 5;

export default function AdminDashboardHeader({
  userName,
  view,
  setView,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const visibleItems = allMenuItems.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenItems = allMenuItems.slice(MAX_VISIBLE_ITEMS);

  const getIsSelected = (itemValue: string) => {
    if (pathname.startsWith("/so-search")) {
      return itemValue === "so_search";
    }
    return itemValue === view;
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (value: string) => {
    if (value === "so_search") {
      router.push("/so-search");
    } else {
      setView(value as ViewType);
    }
    handleMenuClose();
  };

  const isActiveItemHidden = hiddenItems.some((item) =>
    getIsSelected(item.value)
  );

  return (
    <AppBar
      position="static"
      elevation={1}
      color="default"
      sx={{ px: 0, boxShadow: 2, bgcolor: "background.paper" }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, md: 4 },
          pr: { xs: 8, md: 10 },
          py: 1,
          minHeight: 64,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            mr: 3,
          }}
        >
          {getGreeting()}
          {userName && (
            <>
              ,&nbsp;
              <Box
                component="span"
                sx={{
                  color: FANUC_BLUE,
                  fontWeight: 600,
                }}
              >
                {userName}
              </Box>
            </>
          )}
        </Typography>

        <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {visibleItems.map((item) => {
              const isSelected = getIsSelected(item.value);
              return (
                <Button
                  key={item.value}
                  disableRipple
                  variant="text"
                  startIcon={item.icon}
                  onClick={() => handleMenuItemClick(item.value)}
                  sx={{
                    borderRadius: 0,
                    px: 2,
                    py: 1.5,
                    minWidth: "auto",
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? FANUC_BLUE : theme.palette.text.secondary,
                    bgcolor: "transparent",
                    boxShadow: "none",
                    borderBottom: isSelected
                      ? `3px solid ${FANUC_BLUE}`
                      : "3px solid transparent",
                    "&:hover": {
                      color: FANUC_BLUE,
                      background: theme.palette.action.hover,
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

            {hiddenItems.length > 0 && (
              <>
                <Button
                  disableRipple
                  variant="text"
                  onClick={handleMoreClick}
                  endIcon={<ChevronDown size={20} />}
                  sx={{
                    borderRadius: 0,
                    px: 2,
                    py: 1.5,
                    minWidth: "auto",
                    fontWeight: isActiveItemHidden ? 700 : 500,
                    color: isActiveItemHidden
                      ? FANUC_BLUE
                      : theme.palette.text.secondary,
                    borderBottom: isActiveItemHidden
                      ? `3px solid ${FANUC_BLUE}`
                      : "3px solid transparent",
                    "&:hover": {
                      color: FANUC_BLUE,
                      background: theme.palette.action.hover,
                    },
                    textTransform: "none",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  More
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  PaperProps={{
                    style: { maxHeight: 48 * 4.5, width: "20ch" },
                  }}
                >
                  {hiddenItems.map((item) => {
                    const isSelected = getIsSelected(item.value);
                    return (
                      <MenuItem
                        key={item.value}
                        selected={isSelected}
                        onClick={() => handleMenuItemClick(item.value)}
                        sx={{
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? FANUC_BLUE : "inherit",
                          "& .lucide": {
                            marginRight: 1.5,
                            color: isSelected
                              ? FANUC_BLUE
                              : theme.palette.action.active,
                            width: 18,
                            height: 18,
                          },
                        }}
                      >
                        {item.icon} {item.label}
                      </MenuItem>
                    );
                  })}
                </Menu>
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ ml: 1, whiteSpace: "nowrap" }}>
          <LogoutButton sx={{ px: { xs: 3, md: 4 }, py: 1.5 }} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}