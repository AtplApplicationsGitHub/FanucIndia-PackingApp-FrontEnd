"use client";

import { Box, Paper, Typography, alpha } from "@mui/material";
import {
  Layers3,
  Box as BoxIcon,
  Bookmark,
  LockKeyhole,
  UserRoundCheck,
} from "lucide-react";
import type {
  FreeStockFilters,
  FreeStockStatusSummary,
  FreeStockSummaryItem,
} from "../../../types/freeStock";

type Props = {
  status: FreeStockFilters["status"];
  summary: FreeStockStatusSummary | null;
  onChange: (status: FreeStockFilters["status"]) => void;
  admin: boolean;
  mine: boolean;
  myReservations: FreeStockSummaryItem | null;
  onMineChange: (value: boolean) => void;
};

const CARDS = [
  { key: "ALL", title: "Total Stock", Icon: Layers3 },
  { key: "OPEN", title: "Open", Icon: BoxIcon },
  { key: "RESERVED", title: "Reserved", Icon: Bookmark },
  { key: "CLOSED", title: "Closed", Icon: LockKeyhole },
] as const;

export default function FreeStockStatusCards({
  status,
  summary,
  onChange,
  admin,
  mine,
  myReservations,
  onMineChange,
}: Props) {
  const totalLines = summary?.ALL?.count ?? 0;
  const cards = admin
    ? CARDS
    : [
        ...CARDS,
        {
          key: "MINE" as const,
          title: "My Reservations",
          Icon: UserRoundCheck,
        },
      ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(1, minmax(0, 1fr))",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: admin ? "repeat(4, minmax(0, 1fr))" : "repeat(5, minmax(0, 1fr))",
        },
        gap: 1.5,
        mb: 1.2,
      }}
    >
      {cards.map((card) => {
        const isMine = card.key === "MINE";

        const isSelected = isMine ? mine : !mine && status === card.key;

        const metrics = isMine ? myReservations : summary?.[card.key];

        const count = metrics?.count ?? 0;
        const lines = count.toLocaleString();
        const units = metrics?.stockQty ?? "0";

        const percentage =
          card.key === "ALL"
            ? 100
            : totalLines > 0
              ? (count / totalLines) * 100
              : 0;

        const progress = Math.min(100, Math.max(0, percentage));

        const Icon = card.Icon;

        const handleClick = () => {
          if (isMine) {
            onMineChange(!mine);
          } else {
            onChange(card.key);
          }
        };

        return (
          <Paper
            key={card.key}
            variant="outlined"
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`${card.title}: ${lines} lines, ${units} units`}
            onClick={handleClick}
            onKeyDown={(event) => {
              if (
                event.target === event.currentTarget &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                handleClick();
              }
            }}
            sx={(theme) => ({
              px: 1.75,
              py: 1.4,
              minWidth: 0,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 0.4,
              cursor: "pointer",
              bgcolor: "background.paper",
              borderColor: isSelected
                ? theme.palette.primary.main
                : theme.palette.divider,
              boxShadow: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
              "&:hover": {
                borderColor: theme.palette.primary.main,
              },
              "&:focus-visible": {
                outline: `3px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            })}
          >
            {/* Top: text on the left, icon on the right */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 1.5,
                minWidth: 0,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                {/* Title */}
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "text.primary",
                    lineHeight: 1,
                    mb: 0.6,
                  }}
                >
                  {card.title}
                </Typography>

                {/* Lines count */}
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
                  <Typography
                    sx={{
                      fontSize: 30,
                      fontWeight: 800,
                      lineHeight: 1,
                      color: "text.primary",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {lines}
                  </Typography>
                </Box>

                {/* Units */}
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "text.secondary",
                  }}
                >
                  {units} units
                </Typography>
              </Box>

              {/* Icon (right) */}
              <Box
                sx={(theme) => ({
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 2,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                })}
              >
                <Icon size={21} strokeWidth={1.9} />
              </Box>
            </Box>

            {/* Progress bar (yellow) */}
            <Box
              sx={(theme) => ({
                height: 6,
                borderRadius: 5,
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                overflow: "hidden",
              })}
            >
              <Box
                sx={(theme) => ({
                  height: "100%",
                  width: `${progress}%`,
                  bgcolor: theme.palette.primary.main,
                  borderRadius: 5,
                  transition: "width 0.3s ease",
                })}
              />
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
