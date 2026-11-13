"use client";

import { Box, Paper, Typography } from "@mui/material";
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
  const cards = admin
    ? CARDS
    : [
        {
          key: "MINE" as const,
          title: "My Reservations",
          Icon: UserRoundCheck,
        },
        ...CARDS,
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
        gap: 1,
        mb: 1.2,
      }}
    >
      {cards.map((card) => {
        const isMine = card.key === "MINE";

        const isSelected = isMine ? mine : !mine && status === card.key;

        const metrics = isMine ? myReservations : summary?.[card.key];

        const count = metrics?.count ?? 0;
        const lines = count.toLocaleString();

        const units = Number(metrics?.stockQty ?? 0).toLocaleString("en-IN", {
          maximumFractionDigits: 3,
        });

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
              px: 1.5,
              py: 0.8,
              minWidth: 0,
              borderRadius: 2,
              height: "100%",
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",

              // Same styling as Audit Planning cards
              bgcolor: "background.paper",

              borderColor: isSelected ? theme.palette.primary.main : undefined,

              boxShadow: isSelected
                ? `0 0 0 1px ${theme.palette.primary.main}`
                : "none",

              transition: "border-color 0.15s, box-shadow 0.15s",

              "&:hover": {
                borderColor: theme.palette.primary.main,
              },

              "&:focus-visible": {
                outline: `3px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            })}
          >
            {/* Left: title, lines and units */}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {/* Card title */}
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "text.primary",
                  lineHeight: 1.2,
                  mb: 0.5,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {card.title}
              </Typography>

              {/* Lines and units side by side */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.75,
                  minWidth: 0,
                }}
              >
                {/* Total lines */}
                <Typography
                  sx={{
                    width: 85,
                    flexShrink: 0,
                    fontSize: 22,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    color: "text.primary",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}
                >
                  {lines}
                </Typography>

                {/* Vertical divider */}
                <Box
                  sx={{
                    width: "1px",
                    height: 30,
                    flexShrink: 0,
                    bgcolor: "divider",
                  }}
                />

                {/* Total units */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 0.5,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "text.primary",
                      lineHeight: 1.2,
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {units}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.secondary",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    units
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right: yellow icon */}
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
              <Icon size={18} strokeWidth={1.9} />
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
