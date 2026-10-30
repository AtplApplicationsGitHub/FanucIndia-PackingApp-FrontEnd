"use client";

import { Box, alpha, useTheme } from "@mui/material";
import type { ChipProps } from "@mui/material";

/** Same pill as the STATUS / PAYMENT column of the Orders list. */
export default function AuditStatusPill({
  label,
  color = "default",
}: {
  label: string;
  color?: ChipProps["color"];
}) {
  const theme = useTheme();
  const colorMain =
    color === "default" ? theme.palette.grey[500] : theme.palette[color].main;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3px 10px",
        borderRadius: "16px",
        border: "1px solid",
        borderColor: alpha(colorMain, 0.5),
        backgroundColor: alpha(colorMain, 0.1),
        color: theme.palette.mode === "dark" ? "#ffffff" : colorMain,
        fontSize: "0.75rem",
        fontWeight: 600,
        minWidth: "50px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  );
}
