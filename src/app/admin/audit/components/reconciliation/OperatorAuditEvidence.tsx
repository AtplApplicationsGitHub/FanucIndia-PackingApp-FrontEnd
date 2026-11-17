"use client";

import { Box, Typography } from "@mui/material";

type Props = {
  ydNumber?: string | null;
  soNumber?: string | null;
  operatorRemarks?: string | null;
  skipReason?: string | null;
};

export default function OperatorAuditEvidence({ ydNumber, soNumber, operatorRemarks, skipReason }: Props) {
  if (!ydNumber && !soNumber && !operatorRemarks && !skipReason) return null;
  return (
    <Box sx={{ mt: 0.5, maxWidth: 360, whiteSpace: "normal", overflowWrap: "anywhere" }}>
      {ydNumber && <Typography variant="caption" component="div">YD: {ydNumber}</Typography>}
      {soNumber && <Typography variant="caption" component="div">SO: {soNumber}</Typography>}
      {operatorRemarks && <Typography variant="caption" component="div" color="text.secondary">Operator remarks: {operatorRemarks}</Typography>}
      {skipReason && <Typography variant="caption" component="div" color="warning.main" fontWeight={600}>Skipped: {skipReason}</Typography>}
    </Box>
  );
}
