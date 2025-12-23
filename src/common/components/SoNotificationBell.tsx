"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  ListItemText,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { useRouter, usePathname } from "next/navigation"; 
import { API } from "@/common/lib/endpoints";

type NotificationItem = {
  id: number;
  createdAt: string;
  salesOrderNumber: string;
  fromUsername: string;
  messageId: number;
};

interface BackendNotification {
  id: number;
  createdAt: string;
  messageId: number;
  salesOrder?: {
    saleOrderNumber: string;
  };
  message?: {
    fromUser?: {
      name: string;
    };
  };
}

export default function SoNotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // State for token to ensure it updates on navigation/login
  const [token, setToken] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  const open = Boolean(anchorEl);

  // Update token whenever the path changes (e.g. redirect after login)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, [pathname]);

  const fetchNotifications = async (currentToken: string) => {
    try {
      const res = await axios.get(API.SO_NOTIFICATIONS.LIST, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      const mapped: NotificationItem[] = (res.data || []).map((n: BackendNotification) => ({
        id: n.id,
        createdAt: n.createdAt,
        salesOrderNumber: n.salesOrder?.saleOrderNumber || "",
        fromUsername: n.message?.fromUser?.name || "",
        messageId: n.messageId,
      }));

      setItems(mapped);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const removeNotification = async (id: number) => {
    if (!token) return;
    try {
      await axios.delete(API.SO_NOTIFICATIONS.DELETE(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (error) {
      console.error("Failed to remove notification", error);
    }
  };

  useEffect(() => {
    if (!token) return;

    // 1. Fetch initial notifications (HTTP)
    fetchNotifications(token);

    // 2. Connect Socket (WebSocket)
    const s = io(API.SO_SOCKET_BASE, {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = s;

    s.on("connect", () => {
      console.log("Socket connected notification service");
    });

    s.on("notification:new", (payload: NotificationItem) => {
      console.log("Real-time notification received:", payload);
      setItems((prev) => [payload, ...prev]);
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={items.length} color="error">
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ style: { width: 320 } }}
      >
        {items.length === 0 ? (
          <MenuItem disabled>No notifications</MenuItem>
        ) : (
          items.map((n) => (
            <MenuItem
              key={n.id}
              onClick={async () => {
                router.push(
                  `/so-search/${encodeURIComponent(n.salesOrderNumber)}?chat=1`
                );
                await removeNotification(n.id);
                setAnchorEl(null);
              }}
              sx={{ whiteSpace: "normal", alignItems: "flex-start" }}
            >
              <ListItemText
                // Fix for Hydration Error: Render as div to allow nested Box
                secondaryTypographyProps={{ component: "div" }}
                primary={
                  <Typography fontWeight={700}>
                    Message from {n.fromUsername} for {n.salesOrderNumber}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(n.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}