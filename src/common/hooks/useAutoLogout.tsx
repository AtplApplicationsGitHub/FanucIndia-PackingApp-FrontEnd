"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export function useAutoLogout(timeoutMinutes = 10) {
  const router = useRouter();
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleLogout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setOpen(true);
      setTimeout(() => {
        setOpen(false);
        router.push("/login");
      }, 4000);
    }

    function resetTimer() {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      timeout.current = setTimeout(
        handleLogout,
        timeoutMinutes * 60 * 1000
      );
    }

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();

    return () => {
      if (timeout.current) clearTimeout(timeout.current);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [router, timeoutMinutes]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={() => setOpen(false)}
        severity="error"
        sx={{ width: "100%" }}
      >
        Session expired due to inactivity. Please log in again.
      </Alert>
    </Snackbar>
  );
}
