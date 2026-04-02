"use client";

import * as React from "react";
import Button, { ButtonProps } from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";

const buttonSx = {
  bgcolor: (theme: Theme) => theme.palette.action.hover,
  color: (theme: Theme) => theme.palette.text.primary,
  borderRadius: 0,
  clipPath:
    "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
  fontWeight: 600,
  fontSize: 14,
  minWidth: 80,
  height: 34,
  whiteSpace: "nowrap",
  textTransform: "none" as const,
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    bgcolor: (theme: Theme) => theme.palette.primary.main,
    color: (theme: Theme) => theme.palette.primary.contrastText,
    boxShadow: "0 4px 8px rgba(208,0,0,0.3)",
    "& .MuiSvgIcon-root, & svg": {
      color: "#000",
    },
  },
  "&:disabled": {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};

export type CommonButtonProps = ButtonProps;

export default function CommonButton({ sx, ...props }: CommonButtonProps) {
  return (
    <Button
      {...props}
      sx={
        [
          ...(Array.isArray(buttonSx) ? buttonSx : [buttonSx]),
          ...(Array.isArray(sx) ? sx : [sx]),
        ] as SxProps<Theme>
      }
    />
  );
}