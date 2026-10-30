"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Box, Paper, Typography } from "@mui/material";
import CommonButton from "@/common/components/CommonButton";

import type { AuditType } from "../../types/audit";
import { AUDIT_CREATE_ROUTES } from "../../utils/auditRoutes";
import { Plus } from "lucide-react";

type Props = {
  title: string;
  count: number;
  type: AuditType;
  icon: ReactNode;
  /** This card's audit type is the one currently listed below the cards */
  selected?: boolean;
  onSelect: () => void;
};

export default function AuditTypeCard({
  title,
  count,
  type,
  icon,
  selected = false,
  onSelect,
}: Props) {
  const router = useRouter();

  const handleCreateAudit = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation(); // don't also select the card
    router.push(AUDIT_CREATE_ROUTES[type]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    // only when the card itself is focused, not its CREATE button
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <Paper
      variant="outlined"
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      sx={(theme) => ({
        px: 1.5,
        py: 1.2,
        borderRadius: 2,
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 1,
        cursor: "pointer",
        // App yellow (theme primary) - same token in light and dark mode.
        // The extra 1px ring keeps the card size unchanged when selected.
        borderColor: selected ? theme.palette.primary.main : undefined,
        boxShadow: selected
          ? `0 0 0 1px ${theme.palette.primary.main}`
          : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        "&:hover": { borderColor: theme.palette.primary.main },
      })}
    >
      {/* Audit icon */}
      <Box
        sx={{
          width: 38,
          height: 40,
          flexShrink: 0,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderRadius: 1,
          display: "grid",
          placeItems: "center",
        }}
      >
        {icon}
      </Box>

      {/* Audit title and count */}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography fontWeight={700} noWrap title={title}>
          {title}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{
            display: "block",
          }}
        >
          {count} total audits
        </Typography>
      </Box>

      {/* Navigate to the dedicated Create Audit page */}
      <CommonButton
        variant="contained"
        onClick={handleCreateAudit}
        startIcon={<Plus size={15} />}
        sx={{
          flexShrink: 0,
          height: 30,
          fontSize: 13,
          "& .MuiButton-startIcon": {
            marginRight: 0.5,
          },
        }}
      >
        CREATE
      </CommonButton>
    </Paper>
  );
}
