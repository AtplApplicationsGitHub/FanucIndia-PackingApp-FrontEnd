"use client";

import { useState, useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function GlobalSnackbar() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"error" | "warning" | "info" | "success">("error");
  const [duration, setDuration] = useState(4000);

  useEffect(() => {
    const handleGlobalMessage = (event: any) => {
      setMessage(event.detail.message || "An unexpected error occurred.");
      setSeverity(event.detail.severity || "error");
      const text = String(event.detail.message || "");
      setDuration(event.detail.duration || (text.length > 120 || text.includes("\n") ? 10000 : 4000));
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
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ zIndex: 9999 }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        sx={{ width: "100%", maxWidth: 640, maxHeight: 260, overflowY: "auto", whiteSpace: "pre-line" }}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
}