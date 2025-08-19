"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/common/lib/api";
import { SalesOrder } from "@/app/admin/components/types/admin";

export type UserDashboardView = "home" | "pick_pack";

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

  // On initial load, check session storage for a saved view
  useEffect(() => {
    const savedView = sessionStorage.getItem("userDashboardView") as UserDashboardView;
    if (savedView) {
      setViewInternal(savedView);
      // Clean up the storage after using it
      sessionStorage.removeItem("userDashboardView");
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

  // Wrapper for setView to also save to session storage
  const setView = (newView: UserDashboardView) => {
    sessionStorage.setItem("userDashboardView", newView);
    setViewInternal(newView);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/user-dashboard/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (err) {
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
