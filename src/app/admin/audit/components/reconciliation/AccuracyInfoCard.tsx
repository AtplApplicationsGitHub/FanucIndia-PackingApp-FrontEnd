"use client";

import { useState, type MouseEvent } from "react";
import { Box, IconButton, Popover, Typography } from "@mui/material";
import { Info } from "lucide-react";

export default function AccuracyInfoCard() {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchor);
  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchor(event.currentTarget);
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label="How accuracy is calculated"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={handleOpen}
        sx={{ p: 0.25, flexShrink: 0, color: "text.secondary" }}
      >
        <Info size={14} />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box role="dialog" aria-label="Accuracy calculation" sx={{ p: 2, maxWidth: 360 }}>
          <Typography variant="subtitle2" fontWeight={700}>How accuracy is calculated</Typography>
          <Typography variant="body2" sx={{ mt: 1 }} fontWeight={600}>Line accuracy</Typography>
          <Typography variant="body2">Valid lines ÷ (Expected lines + Unexpected lines) × 100</Typography>
          <Typography variant="body2" sx={{ mt: 1 }} fontWeight={600}>Quantity accuracy</Typography>
          <Typography variant="body2">max(0, 1 − Wrong pieces ÷ Expected pieces) × 100</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Wrong pieces = sum of the absolute difference between scanned and expected quantities, including unexpected pieces.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            While In Progress, accuracy covers uploaded locations only. Reviewing discrepancies does not change accuracy. Search and filters do not change this card.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Percentages are displayed as whole numbers. The bar uses the underlying line accuracy: green ≥98%, orange ≥95%, red below 95%. A dash means there is no data to calculate that value.
          </Typography>
        </Box>
      </Popover>
    </>
  );
}
