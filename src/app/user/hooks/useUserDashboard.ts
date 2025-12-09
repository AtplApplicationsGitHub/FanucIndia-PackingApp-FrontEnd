"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API } from "@/common/lib/endpoints"; 
import { SalesOrder } from "@/app/admin/components/types/admin";

export type UserDashboardView = "home" | "pick_pack" | "dispatch" | "fg_dashboard";

export function useUserDashboard() {
  const [userName, setUserName] = useState<string>("");
  const [view, setViewInternal] = useState<UserDashboardView>("home");
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    severity: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  useEffect(() => {
    const savedView = sessionStorage.getItem("userDashboardView") as UserDashboardView;
    if (savedView) {
      setViewInternal(savedView);
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || "");
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  const setView = (newView: UserDashboardView) => {
    sessionStorage.setItem("userDashboardView", newView);
    setViewInternal(newView);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(API.USER_DASHBOARD.ORDERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch {
      setError("Failed to fetch assigned orders.");
      setAlert({ severity: "error", message: "Could not load your orders." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === "pick_pack") {
      fetchOrders();
    }
  }, [view, fetchOrders]);

  return {
    userName,
    view,
    setView,
    orders,
    loading,
    error,
    alert,
    setAlert,
    fetchOrders,
  };
}
