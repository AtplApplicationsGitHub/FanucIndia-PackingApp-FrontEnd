"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  MapPin,
  Menu as MenuIcon,
  X,
  TrendingUp,
  ClipboardCheck,
  Layers3,
  Database,
  PackageOpen,
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
  | "manual_fg"
  | "assignso"
  | "status_hub"
  | "customer_report"
  | "fg_report"
  | "archived"
  | "efficiency_report"
  | "free_stock";

type Props = {
  userName: string;
  view: ViewType;
  setView: React.Dispatch<React.SetStateAction<ViewType>>;
  showBackButton?: boolean;
};
const DASHBOARD_ITEM = {
  label: "DASHBOARD",
  icon: <BarChart3 className="mr-1 h-4 w-4" />,
  value: "home",
};

const DIMS_MENU = [
  { label: "ASSIGN SO", value: "assignso", icon: <ClipboardList size={16} /> },
  { label: "ORDER LIST", value: "orders", icon: <ClipboardList size={16} /> },
  { label: "SO SEARCH", value: "so_search", icon: <Search size={16} /> },
  { label: "DISPATCH", value: "dispatch", icon: <Truck size={16} /> },
];

const DIMS_VALUES: string[] = DIMS_MENU.map((d) => d.value);

const FREE_STOCK_ITEM = {
  label: "FREE - STOCK",
  icon: <PackageOpen size={16} />,
  value: "free_stock",
};

const AUDIT_MENU = [
  {
    label: "AUDIT PLANNING",
    value: "audit_planning",
    route: "/admin/audit/planning",
    icon: <ClipboardCheck size={16} />,
  },
];

const AUDIT_VALUES = AUDIT_MENU.map((a) => a.value);

const REPORTS_MENU = [
  { label: "FG DASHBOARD", value: "fg_dashboard", icon: <Grid size={16} /> },
  { label: "STATUS HUB", value: "status_hub", icon: <Activity size={16} /> },
  {
    label: "CUSTOMER REPORT",
    value: "customer_report",
    icon: <Users size={16} />,
  },
  { label: "FG STORAGE", value: "fg_report", icon: <Boxes size={16} /> },
  { label: "MANUAL FG", value: "manual_fg", icon: <MapPin size={16} /> },
  {
    label: "ARCHIVED DATA",
    value: "archived",
    icon: <ArchiveIcon size={16} />,
  },
  {
    label: "EFFICIENCY REPORT",
    value: "efficiency_report",
    icon: <TrendingUp size={16} />,
  },
];

const REPORT_VALUES: string[] = REPORTS_MENU.map((r) => r.value);

export default function AdminDashboardHeader({
  userName,
  view,
  setView,
  showBackButton,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const [dimsAnchor, setDimsAnchor] = useState<null | HTMLElement>(null);
  const dimsOpen = Boolean(dimsAnchor);

  const [reportsAnchor, setReportsAnchor] = useState<null | HTMLElement>(null);
  const reportsOpen = Boolean(reportsAnchor);
  const [auditAnchor, setAuditAnchor] = useState<null | HTMLElement>(null); // NEW
  const auditOpen = Boolean(auditAnchor);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDimsOpen, setDrawerDimsOpen] = useState(false);
  const [drawerReportsOpen, setDrawerReportsOpen] = useState(false);
  const [drawerAuditOpen, setDrawerAuditOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  const [showDesktopNav, setShowDesktopNav] = useState(false);

  const updateNavbarLayout = useCallback(() => {
    const toolbar = toolbarRef.current;
    const logo = logoRef.current;
    const nav = navRef.current;
    const user = userRef.current;

    if (!toolbar || !logo || !nav || !user) return;

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
      user.getBoundingClientRect().width +
      32;

    setShowDesktopNav(requiredWidth <= availableWidth);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(updateNavbarLayout);

    const elements = [
      toolbarRef.current,
      logoRef.current,
      navRef.current,
      userRef.current,
      backRef.current,
    ];

    elements.forEach((element) => {
      if (element) observer.observe(element);
    });

    document.fonts.ready.then(updateNavbarLayout);
    updateNavbarLayout();

    return () => observer.disconnect();
  }, [updateNavbarLayout]);

  const getIsSelected = (itemValue: string) => {
    if (pathname.startsWith("/so-search")) return itemValue === "so_search";
    return itemValue === view;
  };

  const isDimsSelected =
    pathname.startsWith("/so-search") || DIMS_VALUES.includes(view);

  const handleMenuItemClick = (value: string) => {
    if (value === "so_search") {
      router.push("/so-search");
    } else {
      setView(value as ViewType);
    }

    setDimsAnchor(null);
    setDrawerOpen(false);
    setDrawerDimsOpen(false);
  };

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
          ref={toolbarRef}
          sx={{
            display: "flex",
            justifyContent: "flex-start",
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
              ml: 0,
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

          {/* Desktop Navigation */}
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
              {/* DASHBOARD */}
              <Button
                disableRipple
                variant="text"
                onClick={() => handleMenuItemClick(DASHBOARD_ITEM.value)}
                sx={navButtonSx(
                  view === "home" && !pathname.startsWith("/so-search"),
                )}
              >
                {DASHBOARD_ITEM.icon}
                {DASHBOARD_ITEM.label}
              </Button>

              {/* DIMS dropdown */}
              <Button
                disableRipple
                variant="text"
                onClick={(e) => setDimsAnchor(e.currentTarget)}
                endIcon={<ChevronDown size={16} />}
                sx={navButtonSx(isDimsSelected)}
              >
                <Database className="mr-1 h-4 w-4" />
                DIMS
              </Button>

              <Menu
                anchorEl={dimsAnchor}
                open={dimsOpen}
                onClose={() => setDimsAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{ sx: { width: 250 } }}
              >
                {DIMS_MENU.map((d) => (
                  <MenuItem
                    key={d.value}
                    selected={getIsSelected(d.value)}
                    onClick={() => handleMenuItemClick(d.value)}
                  >
                    <ListItemIcon>{d.icon}</ListItemIcon>
                    <ListItemText>{d.label}</ListItemText>
                  </MenuItem>
                ))}
              </Menu>

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
                PaperProps={{ sx: { width: 250 } }}
              >
                {REPORTS_MENU.map((r) => (
                  <MenuItem
                    key={r.value}
                    selected={view === r.value}
                    onClick={() => {
                      setView(r.value as ViewType);
                      setReportsAnchor(null);
                    }}
                  >
                    <ListItemIcon>{r.icon}</ListItemIcon>
                    <ListItemText>{r.label}</ListItemText>
                  </MenuItem>
                ))}
              </Menu>

              {/* AUDIT dropdown */}
              <Button
                disableRipple
                variant="text"
                onClick={(e) => setAuditAnchor(e.currentTarget)}
                endIcon={<ChevronDown size={16} />}
                sx={navButtonSx(AUDIT_VALUES.includes(view))}
              >
                <Layers3 className="mr-1 h-4 w-4" />
                AUDIT
              </Button>
              <Menu
                anchorEl={auditAnchor}
                open={auditOpen}
                onClose={() => setAuditAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{
                  sx: {
                    width: 250,
                    maxWidth: "calc(100vw - 32px)",
                  },
                }}
              >
                {AUDIT_MENU.map((a) => (
                  <MenuItem
                    key={a.value}
                    selected={view === a.value}
                    onClick={() => {
                      router.push(a.route);
                      setAuditAnchor(null);
                    }}
                  >
                    <ListItemIcon>{a.icon}</ListItemIcon>
                    <ListItemText
                      primary={a.label}
                      primaryTypographyProps={{
                        sx: {
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                        },
                      }}
                    />
                  </MenuItem>
                ))}
              </Menu>

              {/* FREE - STOCK */}
              <Button
                disableRipple
                variant="text"
                onClick={() => handleMenuItemClick(FREE_STOCK_ITEM.value)}
                sx={navButtonSx(view === "free_stock")}
              >
                {FREE_STOCK_ITEM.icon}
                {FREE_STOCK_ITEM.label}
              </Button>
            </Box>
          </Box>

          {/* Right: UserMenu + Hamburger (mobile) */}
          <Box
            sx={{
              ml: showDesktopNav ? 0 : "auto",
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, md: 1 },
            }}
          >
            <Box ref={userRef} sx={{ flexShrink: 0 }}>
              <UserMenu username={userName} userRole="ADMIN" variant="full" />
            </Box>
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
              <MenuIcon size={22} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerReportsOpen(false);
          setDrawerAuditOpen(false);
          setDrawerDimsOpen(false);
        }}
        PaperProps={{
          sx: {
            width: 260,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
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
            onClick={() => {
              setDrawerOpen(false);
              setDrawerReportsOpen(false);
              setDrawerAuditOpen(false);
              setDrawerDimsOpen(false);
            }}
            sx={{
              color: theme.palette.primary.contrastText,
              "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
            }}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </IconButton>
        </Box>

        {/* Nav Items */}
        <List disablePadding>
          {/* Main items */}

          {/* DASHBOARD */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleMenuItemClick(DASHBOARD_ITEM.value)}
              sx={{
                px: 2,
                py: 1.5,
                borderLeft:
                  view === "home"
                    ? `4px solid ${theme.palette.primary.contrastText}`
                    : "4px solid transparent",
                bgcolor:
                  view === "home" ? "rgba(255,255,255,0.1)" : "transparent",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.contrastText,
                  minWidth: 36,
                }}
              >
                {DASHBOARD_ITEM.icon}
              </ListItemIcon>

              <ListItemText
                primary={DASHBOARD_ITEM.label}
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: theme.palette.primary.contrastText,
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* DIMS DROPDOWN */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setDrawerDimsOpen((prev) => !prev)}
              aria-expanded={drawerDimsOpen}
              sx={{
                px: 2,
                py: 1.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.contrastText,
                  minWidth: 32,
                }}
              >
                <Database size={16} />
              </ListItemIcon>

              <ListItemText
                primary="DIMS"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  color: theme.palette.primary.contrastText,
                }}
              />

              <ChevronDown
                size={18}
                style={{
                  transform: drawerDimsOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </ListItemButton>
          </ListItem>

          {drawerDimsOpen &&
            DIMS_MENU.map((d) => {
              const isSelected = getIsSelected(d.value);

              return (
                <ListItem key={d.value} disablePadding>
                  <ListItemButton
                    onClick={() => handleMenuItemClick(d.value)}
                    sx={{
                      pl: 4,
                      py: 1.2,
                      borderLeft: isSelected
                        ? `4px solid ${theme.palette.primary.contrastText}`
                        : "4px solid transparent",
                      bgcolor: isSelected
                        ? "rgba(255,255,255,0.1)"
                        : "transparent",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.08)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: theme.palette.primary.contrastText,
                        minWidth: 32,
                      }}
                    >
                      {d.icon}
                    </ListItemIcon>

                    <ListItemText
                      primary={d.label}
                      primaryTypographyProps={{
                        fontWeight: isSelected ? 700 : 600,
                        fontSize: "0.82rem",
                        color: theme.palette.primary.contrastText,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setDrawerReportsOpen((prev) => !prev)}
              aria-expanded={drawerReportsOpen}
              sx={{
                px: 2,
                py: 1.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
              }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.contrastText,
                  minWidth: 32,
                }}
              >
                <FileBarChart size={16} />
              </ListItemIcon>

              <ListItemText
                primary="REPORTS"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  color: theme.palette.primary.contrastText,
                }}
              />

              <ChevronDown
                size={18}
                style={{
                  transform: drawerReportsOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </ListItemButton>
          </ListItem>
          {drawerReportsOpen && (
            <>
              {REPORTS_MENU.map((r) => {
                const isSelected = view === r.value;
                return (
                  <ListItem key={r.value} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        setView(r.value as ViewType);
                        setDrawerOpen(false);
                      }}
                      sx={{
                        pl: 4,
                        py: 1.2,
                        borderLeft: isSelected
                          ? `4px solid ${theme.palette.primary.contrastText}`
                          : "4px solid transparent",
                        bgcolor: isSelected
                          ? "rgba(255,255,255,0.1)"
                          : "transparent",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: theme.palette.primary.contrastText,
                          minWidth: 32,
                        }}
                      >
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
            </>
          )}

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setDrawerAuditOpen((prev) => !prev)}
              aria-expanded={drawerAuditOpen}
              sx={{
                px: 2,
                py: 1.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
              }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.contrastText,
                  minWidth: 32,
                }}
              >
                <Layers3 size={16} />
              </ListItemIcon>
              <ListItemText
                primary="AUDIT"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  color: theme.palette.primary.contrastText,
                }}
              />
              <ChevronDown
                size={18}
                style={{
                  transform: drawerAuditOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </ListItemButton>
          </ListItem>
          {drawerAuditOpen &&
            AUDIT_MENU.map((a) => {
              const isSelected = view === a.value;
              return (
                <ListItem key={a.value} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      router.push(a.route);
                      setDrawerOpen(false);
                    }}
                    sx={{
                      pl: 4,
                      py: 1.2,
                      borderLeft: isSelected
                        ? `4px solid ${theme.palette.primary.contrastText}`
                        : "4px solid transparent",
                      bgcolor: isSelected
                        ? "rgba(255,255,255,0.1)"
                        : "transparent",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: theme.palette.primary.contrastText,
                        minWidth: 32,
                      }}
                    >
                      {a.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={a.label}
                      primaryTypographyProps={{
                        fontWeight: isSelected ? 700 : 600,
                        fontSize: "0.8rem",
                        color: theme.palette.primary.contrastText,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}

          {/* FREE - STOCK */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleMenuItemClick(FREE_STOCK_ITEM.value)}
              sx={{
                px: 2,
                py: 1.5,
                borderLeft:
                  view === "free_stock"
                    ? `4px solid ${theme.palette.primary.contrastText}`
                    : "4px solid transparent",
                bgcolor:
                  view === "free_stock"
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: theme.palette.primary.contrastText,
                  minWidth: 36,
                }}
              >
                {FREE_STOCK_ITEM.icon}
              </ListItemIcon>

              <ListItemText
                primary={FREE_STOCK_ITEM.label}
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: theme.palette.primary.contrastText,
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}
