"use client";

import type { ReactNode } from "react";

import { alpha, Box, LinearProgress, Paper, Typography } from "@mui/material";
import { ChevronRight } from "lucide-react";

type Props = {
  title: string;
  value: ReactNode;
  caption?: ReactNode;
  info?: ReactNode;
  icon: ReactNode;
  progress?: number;
  progressColor?: "primary" | "success" | "warning" | "error" | "info";
  onClick?: () => void;
  compact?: boolean;
};

export default function ReconMetricCard({
  title,
  value,
  caption,
  info,
  icon,
  progress,
  progressColor = "primary",
  onClick,
  compact = false,
}: Props) {
  const clickable = Boolean(onClick);

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        position: "relative",
        gap: compact ? 0.75 : 1.25,
        minWidth: 0,
        minHeight: compact ? 68 : 64,
        px: compact ? 1 : 1.5,
        py: compact ? 0.75 : 1.25,
        ...(compact && clickable ? { pr: 2.75 } : {}),
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
        bgcolor: "background.paper",
        cursor: clickable ? "pointer" : "default",
        transition: "border-color .15s, box-shadow .15s, background-color .15s",
        ...(clickable && {
          "&:hover, &:focus-visible": {
            outline: "none",
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            boxShadow: "0 2px 8px rgba(16, 24, 40, 0.10)",
          },
        }),
      })}
    >
      <Box
        sx={{
          alignSelf: "center",
          width: compact ? 24 : 36,
          height: compact ? 24 : 36,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          borderRadius: 1.5,
          color: "primary.contrastText",
          bgcolor: "primary.main",
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <Typography
            sx={{
              minWidth: 0,
              fontSize: compact ? 10 : 11,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "text.secondary",
              lineHeight: 1.4,
            }}
            noWrap={!compact}
          >
            {title}
          </Typography>
          {info}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: 0.75,
            minWidth: 0,
            flexWrap: compact ? "wrap" : "nowrap",
          }}
        >
          <Typography
            sx={{
              fontSize: compact ? 12 : 14,
              fontWeight: 700,
              color: "text.primary",
              lineHeight: 1.4,
              flexShrink: compact ? 1 : 0,
            }}
            noWrap
          >
            {value}
          </Typography>
          {caption && (
            <Typography
              title={typeof caption === "string" ? caption : undefined}
              sx={{
                fontSize: 11,
                color: "text.secondary",
                lineHeight: 1.4,
                minWidth: 0,
              }}
              noWrap
            >
              {caption}
            </Typography>
          )}
        </Box>
        {progress !== undefined && (
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, progress))}
            color={progressColor}
            sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
          />
        )}
      </Box>
      {clickable && (
        <ChevronRight
          size={18}
          style={
            compact
              ? {
                  position: "absolute",
                  right: 6,
                  top: "50%",
                  transform: "translateY(-50%)",
                }
              : undefined
          }
        />
      )}
    </Paper>
  );
}
