"use client";

import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import {
  Box,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import {
  BarChart3,
  ClipboardList,
  Database,
  Users,
  Truck,
  Grid,
  Search,
  ChevronDown,
  FileBarChart,
  Activity,
  Boxes,
  ArchiveIcon,
  ArrowLeft,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import UserMenu from "@/common/components/UserMenu";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import packageJson from "../../../../../package.json";

export type ViewType =
  | "home"
  | "orders"
  | "master"
  | "manage"
  | "dispatch"
  | "fg_dashboard"
  | "assignso"
  | "status_hub"
  | "customer_report"
  | "fg_report"
  | "archived";

type Props = {
  userName: string;
  view: ViewType;
  setView: React.Dispatch<React.SetStateAction<ViewType>>;
  showBackButton?: boolean;
};

const allMenuItems = [
  { label: "DASHBOARD", icon: <BarChart3 className="mr-1 h-4 w-4" />, value: "home" },
  { label: "ASSIGN SO", icon: <ClipboardList className="mr-1 h-4 w-4" />, value: "assignso" },
  { label: "ORDER LIST", icon: <ClipboardList className="mr-1 h-4 w-4" />, value: "orders" },
  { label: "SO SEARCH", icon: <Search className="mr-1 h-4 w-4" />, value: "so_search" },
  { label: "DISPATCH", icon: <Truck className="mr-1 h-4 w-4" />, value: "dispatch" },
  { label: "FG DASHBOARD", icon: <Grid className="mr-1 h-4 w-4" />, value: "fg_dashboard" },
];

const REPORTS_MENU = [
  { label: "STATUS HUB", value: "status_hub", icon: <Activity size={16} /> },
  { label: "CUSTOMER REPORT", value: "customer_report", icon: <Users size={16} /> },
  { label: "FG STORAGE", value: "fg_report", icon: <Boxes size={16} /> },
  { label: "ARCHIVED DATA", value: "archived", icon: <ArchiveIcon size={16} /> },
];

const REPORT_VALUES = ["status_hub", "customer_report", "fg_report", "archived"];
const MAX_VISIBLE_ITEMS = 8;

// All items for the mobile drawer (flat list)
const allDrawerItems = [
  ...allMenuItems,
  { label: "REPORTS", icon: <FileBarChart className="mr-1 h-4 w-4" />, value: "__reports_header__", isHeader: true },
  ...REPORTS_MENU.map((r) => ({ ...r, isSubItem: true })),
  { label: "MASTER", icon: <Database className="mr-1 h-4 w-4" />, value: "master" },
];

export default function AdminDashboardHeader({ userName, view, setView, showBackButton }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const [reportsAnchor, setReportsAnchor] = useState<null | HTMLElement>(null);
  const reportsOpen = Boolean(reportsAnchor);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const visibleItems = allMenuItems.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenItems = allMenuItems.slice(MAX_VISIBLE_ITEMS);

  const getIsSelected = (itemValue: string) => {
    if (pathname.startsWith("/so-search")) return itemValue === "so_search";
    return itemValue === view;
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleMenuItemClick = (value: string) => {
    if (value === "so_search") {
      router.push("/so-search");
    } else {
      setView(value as ViewType);
    }
    handleMenuClose();
    setDrawerOpen(false);
  };

  const isActiveItemHidden = hiddenItems.some((item) => getIsSelected(item.value));

  const navButtonSx = (isSelected: boolean) => ({
    borderRadius: 0,
    px: 1.5,
    py: 1,
    minWidth: "auto",
    fontWeight: isSelected ? 700 : 600,
    color: theme.palette.primary.contrastText,
    bgcolor: "transparent",
    boxShadow: "none",
    borderBottom: isSelected
      ? `3px solid ${theme.palette.primary.contrastText}`
      : "3px solid transparent",
    "&:hover": { bgcolor: "transparent", opacity: 0.8 },
    textTransform: "uppercase",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap",
  });

  return (
    <>
      <AppBar
        position="static"
        elevation={1}
        color="primary"
        sx={{ px: 0, boxShadow: 2, bgcolor: theme.palette.primary.main }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pl: { xs: 1.5, md: 4 },
            pr: { xs: 1, md: 2 },
            py: 0.5,
            minHeight: 20,
          }}
        >
          {/* Back Button */}
          {showBackButton && (
            <IconButton
              onClick={() => router.back()}
              sx={{ mr: 1, color: theme.palette.primary.contrastText, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}
            >
              <ArrowLeft size={24} />
            </IconButton>
          )}

          {/* Logo + Version */}
          <Box
            sx={{ flexGrow: 1, mr: 1, cursor: "pointer", display: "flex", alignItems: "flex-end", gap: 1 }}
            onClick={() => setView("home")}
          >
            <Image src="/Fanuc_India.png" alt="Fanuc India Logo" width={85} height={21} priority />
            <Typography
              variant="caption"
              sx={{ color: theme.palette.primary.contrastText, opacity: 0.7, fontWeight: 600, fontSize: "0.75rem", lineHeight: 1, mb: "2px" }}
            >
              v{packageJson.version}
            </Typography>
          </Box>

          {/* Desktop Nav — hidden on mobile */}
          <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "flex-end" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.1 }}>
              {visibleItems.map((item) => {
                const isSelected = getIsSelected(item.value);
                return (
                  <Button key={item.value} disableRipple variant="text" onClick={() => handleMenuItemClick(item.value)} sx={navButtonSx(isSelected)}>
                    {item.icon}{item.label}
                  </Button>
                );
              })}

              {/* REPORTS dropdown */}
              <Button
                disableRipple
                variant="text"
                onClick={(e) => setReportsAnchor(e.currentTarget)}
                endIcon={<ChevronDown size={16} />}
                sx={navButtonSx(REPORT_VALUES.includes(view))}
              >
                <FileBarChart className="mr-1 h-4 w-4" />
                REPORTS
              </Button>
              <Menu
                anchorEl={reportsAnchor}
                open={reportsOpen}
                onClose={() => setReportsAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
              >
                {REPORTS_MENU.map((r) => (
                  <MenuItem
                    key={r.value}
                    selected={view === r.value}
                    onClick={() => { setView(r.value as ViewType); setReportsAnchor(null); }}
                  >
                    <ListItemIcon>{r.icon}</ListItemIcon>
                    <ListItemText>{r.label}</ListItemText>
                  </MenuItem>
                ))}
              </Menu>

              {/* MASTER */}
              <Button
                disableRipple
                variant="text"
                onClick={() => handleMenuItemClick("master")}
                sx={navButtonSx(view === "master")}
              >
                <Database className="mr-1 h-4 w-4" />
                MASTER
              </Button>

              {/* More overflow */}
              {hiddenItems.length > 0 && (
                <>
                  <Button
                    disableRipple
                    variant="text"
                    onClick={handleMoreClick}
                    endIcon={<ChevronDown size={20} />}
                    sx={navButtonSx(isActiveItemHidden)}
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
                      sx: { bgcolor: theme.palette.primary.main, boxShadow: 3 },
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
                            fontWeight: isSelected ? 700 : 500,
                            color: theme.palette.primary.contrastText,
                            "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
                            "&.Mui-selected": { bgcolor: "rgba(0,0,0,0.08)", "&:hover": { bgcolor: "rgba(0,0,0,0.12)" } },
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

          {/* Right: UserMenu + Hamburger (mobile) */}
          <Box sx={{ ml: { xs: 0.5, md: 0 }, display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 } }}>
            <UserMenu username={userName} userRole="ADMIN" variant="full" />
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                display: { xs: "flex", md: "none" },
                color: theme.palette.primary.contrastText,
                p: 0.5,
                "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
              }}
              aria-label="Open navigation menu"
            >
              <MenuIcon size={22} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 260, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText },
        }}
      >
        {/* Close button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            px: 1,
            py: 1,
            borderBottom: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ color: theme.palette.primary.contrastText, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </IconButton>
        </Box>

        {/* Nav Items */}
        <List disablePadding>
          {/* Main items */}
          {allMenuItems.map((item) => {
            const isSelected = getIsSelected(item.value);
            return (
              <ListItem key={item.value} disablePadding>
                <ListItemButton
                  onClick={() => handleMenuItemClick(item.value)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderLeft: isSelected ? `4px solid ${theme.palette.primary.contrastText}` : "4px solid transparent",
                    bgcolor: isSelected ? "rgba(255,255,255,0.1)" : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon sx={{ color: theme.palette.primary.contrastText, minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 700 : 600,
                      fontSize: "0.85rem",
                      letterSpacing: 0.5,
                      color: theme.palette.primary.contrastText,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}

          {/* REPORTS sub-section label */}
          <ListItem disablePadding>
            <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
              <FileBarChart size={16} color={theme.palette.primary.contrastText} style={{ opacity: 0.6 }} />
              <Typography
                sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1.2, opacity: 0.6, color: theme.palette.primary.contrastText }}
              >
                REPORTS
              </Typography>
            </Box>
          </ListItem>
          {REPORTS_MENU.map((r) => {
            const isSelected = view === r.value;
            return (
              <ListItem key={r.value} disablePadding>
                <ListItemButton
                  onClick={() => { setView(r.value as ViewType); setDrawerOpen(false); }}
                  sx={{
                    pl: 4,
                    py: 1.2,
                    borderLeft: isSelected ? `4px solid ${theme.palette.primary.contrastText}` : "4px solid transparent",
                    bgcolor: isSelected ? "rgba(255,255,255,0.1)" : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon sx={{ color: theme.palette.primary.contrastText, minWidth: 32 }}>
                    {r.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={r.label}
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 700 : 600,
                      fontSize: "0.82rem",
                      letterSpacing: 0.4,
                      color: theme.palette.primary.contrastText,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}

          {/* MASTER */}
          {(() => {
            const isSelected = view === "master";
            return (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleMenuItemClick("master")}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderLeft: isSelected ? `4px solid ${theme.palette.primary.contrastText}` : "4px solid transparent",
                    bgcolor: isSelected ? "rgba(255,255,255,0.1)" : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon sx={{ color: theme.palette.primary.contrastText, minWidth: 36 }}>
                    <Database className="h-4 w-4" />
                  </ListItemIcon>
                  <ListItemText
                    primary="MASTER"
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 700 : 600,
                      fontSize: "0.85rem",
                      letterSpacing: 0.5,
                      color: theme.palette.primary.contrastText,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })()}
        </List>
      </Drawer>
    </>
  );
}