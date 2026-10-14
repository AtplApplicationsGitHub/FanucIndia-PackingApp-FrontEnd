"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Box, Button, Paper, Typography } from "@mui/material";
import CommonButton from "@/common/components/CommonButton";

type Props = {
  title: string;
  description: string;
  count: number;
  path: string;
  icon: ReactNode;
};

export default function AuditTypeCard({
  title,
  description,
  count,
  path,
  icon,
}: Props) {
  const router = useRouter();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        height: "100%",
        minHeight: 190,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          bgcolor: "#ffd000",
          borderRadius: 1,
          display: "grid",
          placeItems: "center",
        }}
      >
        {icon}
      </Box>

      <Typography fontWeight={700}>{title}</Typography>

      <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
        {description}
      </Typography>

      <Typography variant="caption">{count} assigned audits</Typography>

      <CommonButton
        fullWidth
        variant="contained"
        onClick={() => router.push(path)}
      >
        Create Audit
      </CommonButton>
    </Paper>
  );
}
