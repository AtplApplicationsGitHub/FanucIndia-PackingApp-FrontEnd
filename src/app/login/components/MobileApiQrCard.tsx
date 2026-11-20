"use client";

import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import apiClient from "@/common/lib/apiClient";
import { API_BASE_URL } from "@/common/lib/endpoints";

type ApiUrlState =
  | { status: "loading" }
  | { status: "ready"; apiUrl: string }
  | { status: "error" };

export default function MobileApiQrCard({ id }: { id: string }) {
  const [apiUrlState, setApiUrlState] = useState<ApiUrlState>({ status: "loading" });
  const titleId = `${id}-title`;

  useEffect(() => {
    const controller = new AbortController();

    apiClient
      .get<{ apiUrl: string }>(`${API_BASE_URL}/app-update/mobile-api-url`, {
        signal: controller.signal,
      })
      .then(({ data }) => {
        if (controller.signal.aborted) return;

        if (typeof data?.apiUrl !== "string" || !data.apiUrl) {
          setApiUrlState({ status: "error" });
          return;
        }

        setApiUrlState({ status: "ready", apiUrl: data.apiUrl });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setApiUrlState({ status: "error" });
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <Paper
      id={id}
      component="section"
      aria-labelledby={titleId}
      aria-busy={apiUrlState.status === "loading"}
      elevation={0}
      sx={{
        position: "absolute",
        top: "100%",
        right: { xs: 2, md: 3 },
        mt: 1.5,
        width: "calc(100% - 32px)",
        boxSizing: "border-box",
        maxWidth: 296,
        px: 1.5,
        py: 1.25,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          aria-hidden="true"
          sx={{
            width: 36,
            height: 36,
            display: "grid",
            placeItems: "center",
            borderRadius: 1.5,
            color: "primary.contrastText",
            bgcolor: "primary.main",
          }}
        >
          <QrCode size={18} />
        </Box>
        <Typography
          id={titleId}
          component="h2"
          sx={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: "text.secondary",
            lineHeight: 1.4,
          }}
        >
          API
        </Typography>
      </Box>

      {apiUrlState.status === "loading" && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress size={28} aria-label="Loading mobile API URL" />
        </Box>
      )}
      {apiUrlState.status === "error" && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          Mobile API URL is unavailable.
        </Alert>
      )}
      {apiUrlState.status === "ready" && (
        <Box sx={{ display: "grid", justifyItems: "center", gap: 1, mt: 1 }}>
          <QRCodeSVG
            value={apiUrlState.apiUrl}
            size={224}
            marginSize={4}
            bgColor="#ffffff"
            fgColor="#000000"
            title="Mobile API QR code"
            style={{ maxWidth: "100%", height: "auto", aspectRatio: "1 / 1" }}
          />
          <Typography
            align="center"
            sx={{
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.4,
              overflowWrap: "anywhere",
              maxWidth: "100%",
            }}
          >
            {apiUrlState.apiUrl}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
