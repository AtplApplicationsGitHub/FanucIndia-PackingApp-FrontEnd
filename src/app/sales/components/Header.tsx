import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Box,
  useTheme,
  Button,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { SalesDashboardView } from "@/app/sales/components/hooks/useSalesDashboard";
import {
  ClipboardList,
  BarChart3,
  Search,
  ArrowLeft,
  Menu,
  X,
  Warehouse,
  PackageOpen,
} from "lucide-react";
import Image from "next/image";
import UserMenu from "@/common/components/UserMenu";
import packageJson from "../../../../package.json";

type Props = {
  userName: string;
  view: SalesDashboardView;
  salesZone: string;
  setView: (view: SalesDashboardView) => void;
  showBackButton?: boolean;
};

const menuItems = [
  {
    label: "DASHBOARD",
    icon: <BarChart3 className="mr-1 h-4 w-4" />,
    value: "home",
  },
  {
    label: "ORDERS",
    icon: <ClipboardList className="mr-1 h-4 w-4" />,
    value: "orders",
  },
  {
    label: "DISPATCHED ORDERS",
    icon: <ClipboardList className="mr-1 h-4 w-4" />,
    value: "dispatched",
  },
  {
    label: "FG STORAGE",
    icon: <Warehouse className="mr-1 h-4 w-4" />,
    value: "fg-storage",
  },
  {
    label: "FREE STOCK",
    icon: <PackageOpen className="mr-1 h-4 w-4" />,
    value: "free_stock",
  },
  {
    label: "SO SEARCH",
    icon: <Search className="mr-1 h-4 w-4" />,
    value: "so_search",
  },
];

export default function SalesDashboardHeader({
  userName,
  salesZone,
  view,
  setView,
  showBackButton,
}: Props) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLParagraphElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  const [showDesktopNav, setShowDesktopNav] = useState(false);

  // Show the full nav only when it fits; otherwise show the hamburger.
  const updateNavbarLayout = useCallback(() => {
    const toolbar = toolbarRef.current;
    const logo = logoRef.current;
    const nav = navRef.current;
    const zone = zoneRef.current;
    const user = userRef.current;

    if (!toolbar || !logo || !nav || !zone || !user) return;

    const styles = window.getComputedStyle(toolbar);

    const availableWidth =
      toolbar.clientWidth -
      parseFloat(styles.paddingLeft) -
      parseFloat(styles.paddingRight);

    const backWidth = backRef.current
      ? backRef.current.getBoundingClientRect().width +
        parseFloat(window.getComputedStyle(backRef.current).marginRight)
      : 0;

    const requiredWidth =
      backWidth +
      logo.getBoundingClientRect().width +
      nav.getBoundingClientRect().width +
      zone.getBoundingClientRect().width +
      user.getBoundingClientRect().width +
      32;

    setShowDesktopNav(requiredWidth <= availableWidth);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(updateNavbarLayout);

    [
      toolbarRef.current,
      logoRef.current,
      navRef.current,
      zoneRef.current,
      userRef.current,
      backRef.current,
    ].forEach((element) => {
      if (element) observer.observe(element);
    });

    document.fonts.ready.then(updateNavbarLayout);
    updateNavbarLayout();

    return () => observer.disconnect();
  }, [updateNavbarLayout]);

  const getIsSelected = (itemValue: string) => {
    if (pathname.startsWith("/so-search")) {
      return itemValue === "so_search";
    }
    return itemValue === view;
  };

  const handleMenuItemClick = (value: string) => {
    if (value === "so_search") {
      router.push("/so-search");
    } else {
      setView(value as SalesDashboardView);
    }
    // Close drawer on mobile after selection
    setDrawerOpen(false);
  };

  return (
    <>
      <AppBar
        position="static"
        color="primary"
        elevation={1}
        sx={{
          bgcolor: theme.palette.primary.main,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar
          ref={toolbarRef}
          sx={{
            justifyContent: "flex-start",
            pl: { xs: 1.5, md: 4 },
            pr: { xs: 1, md: 2 },
            py: 0.5,
            minHeight: 20,
          }}
        >
          {/* Back Button */}
          {showBackButton && (
            <IconButton
              ref={backRef}
              onClick={() => router.back()}
              sx={{
                mr: 1,
                color: theme.palette.primary.contrastText,
                "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
              }}
            >
              <ArrowLeft size={24} />
            </IconButton>
          )}

          {/* Logo + Version */}
          <Box
            ref={logoRef}
            sx={{
              flexGrow: 0,
              flexShrink: 0,
              mr: 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "flex-end",
              gap: 1,
            }}
            onClick={() => setView("home")}
          >
            <Image
              src="/Fanuc_India.png"
              alt="Fanuc India Logo"
              width={85}
              height={21}
              priority
            />
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.primary.contrastText,
                opacity: 0.7,
                fontWeight: 600,
                fontSize: "0.75rem",
                lineHeight: 1,
                mb: "2px",
              }}
            >
              v{packageJson.version}
            </Typography>
          </Box>

          {/* Desktop Nav Menu — hidden on mobile */}
          <Box
            ref={navRef}
            aria-hidden={!showDesktopNav}
            inert={!showDesktopNav}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              flexShrink: 0,
              ml: "auto",
              width: "max-content",
              position: showDesktopNav ? "static" : "absolute",
              visibility: showDesktopNav ? "visible" : "hidden",
              pointerEvents: showDesktopNav ? "auto" : "none",
              left: showDesktopNav ? "auto" : "-9999px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.1 }}>
              {menuItems.map((item) => {
                const isSelected = getIsSelected(item.value);
                return (
                  <Button
                    key={item.value}
                    disableRipple
                    variant="text"
                    onClick={() => handleMenuItemClick(item.value)}
                    sx={{
                      position: "relative",
                      px: 1.5,
                      py: 1,
                      fontWeight: isSelected ? 700 : 600,
                      color: theme.palette.primary.contrastText,
                      borderBottom: isSelected
                        ? `3px solid ${theme.palette.primary.contrastText}`
                        : "3px solid transparent",
                      borderRadius: 0,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "transparent",
                        opacity: 0.8,
                      },
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* Right Section: Zone + Hamburger (mobile only) + User */}
          <Box
            sx={{
              ml: showDesktopNav ? 0 : "auto",
              mb: 0.5,
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, md: 1 },
            }}
          >
            <Typography
              ref={zoneRef}
              variant="body2"
              sx={{
                color: "white",
                bgcolor: "tomato",
                fontWeight: 700,
                px: { xs: 0.7, md: 1 },
                py: 0.7,
                borderRadius: 1,
                fontSize: { xs: "0.65rem", md: "0.75rem" },
                whiteSpace: "nowrap",
              }}
            >
              ZONE: {salesZone.toUpperCase()}
            </Typography>

            <Box ref={userRef} sx={{ flexShrink: 0 }}>
              <UserMenu username={userName} userRole="SALES" variant="full" />
            </Box>

            {/* Hamburger Menu Icon — shown only when the nav doesn't fit */}
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                display: showDesktopNav ? "none" : "flex",
                color: theme.palette.primary.contrastText,
                p: 0.5,
                "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
              }}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
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
          sx: {
            width: 260,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
        }}
      >
        {/* Drawer Header — close button only */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: 1,
            py: 1,
            borderBottom: `1px solid rgba(255,255,255,0.15)`,
          }}
        >
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{
              color: theme.palette.primary.contrastText,
              "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
            }}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </IconButton>
        </Box>

        {/* Nav Items List */}
        <List disablePadding>
          {menuItems.map((item) => {
            const isSelected = getIsSelected(item.value);
            return (
              <ListItem key={item.value} disablePadding>
                <ListItemButton
                  onClick={() => handleMenuItemClick(item.value)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderLeft: isSelected
                      ? `4px solid ${theme.palette.primary.contrastText}`
                      : "4px solid transparent",
                    bgcolor: isSelected
                      ? "rgba(255,255,255,0.1)"
                      : "transparent",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.08)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: theme.palette.primary.contrastText,
                      minWidth: 36,
                    }}
                  >
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
        </List>
      </Drawer>
    </>
  );
}
