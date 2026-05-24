"use client";

import { useState, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function GlobalSnackbar() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"error" | "warning" | "info" | "success">("error");

  useEffect(() => {
    const handleGlobalMessage = (event: any) => {
      setMessage(event.detail.message || "An unexpected error occurred.");
      setSeverity(event.detail.severity || "error");
      setOpen(true);
    };

    window.addEventListener("show-global-message", handleGlobalMessage);
    return () => window.removeEventListener("show-global-message", handleGlobalMessage);
  }, []);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ zIndex: 9999 }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}