"use client";

import { Box, Typography } from "@mui/material";
import FreeStockMetricCard from "../free-stock/prerequisite/FreeStockMetricCard";

type Props = {
  ydNumber?: string | null;
  soNumber?: string | null;
  operatorRemarks?: string | null;
  skipReason?: string | null;
};

export default function OperatorAuditEvidence({
  ydNumber,
  soNumber,
  operatorRemarks,
  skipReason,
}: Props) {
  if (!ydNumber && !soNumber && !operatorRemarks && !skipReason) return null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 1,

        "& .MuiPaper-root p:first-of-type": {
          fontSize: 11,
          fontWeight: 700,
          color: "text.primary",
          letterSpacing: "0.04em",
          lineHeight: 1.4,
          mb: 0.25,
        },
        "& .MuiPaper-root p:last-of-type": {
          fontSize: 14,
          fontWeight: 500,
          color: "text.primary",
          lineHeight: 1.4,
          whiteSpace: "pre-wrap",
        },
      }}
    ></Box>
  );
}
