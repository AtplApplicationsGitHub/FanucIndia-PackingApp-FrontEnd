"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import CreateAuditDialog from "./CreateAuditDialog";
// Phase 2 - Cycle Count has its own create flow (stock upload -> movement period -> plan -> release)
import CreateCycleCountDialog from "../cycle-count/CreateCycleCountDialog";
import type { AuditType } from "../../types/audit";

/** Audit types whose "Create Audit" button is enabled. */
const CREATE_ENABLED: AuditType[] = ["bom", "cycle_count"];
import { Box, Paper, Typography } from "@mui/material";
import CommonButton from "@/common/components/CommonButton";

type Props = {
  title: string;
  count: number;
  type: AuditType;
  icon: ReactNode;
};

export default function AuditTypeCard({ title, count, type, icon }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        height: "100%",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={700}>{title}</Typography>

          <Typography variant="caption" color="text.secondary">
            {count} assigned audits
          </Typography>
        </Box>

        <Box
          sx={{
            width: 36,
            height: 36,
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
      </Box>

      <CommonButton
        variant="contained"
        disabled={!CREATE_ENABLED.includes(type)}
        onClick={() => setOpen(true)}
        sx={{
          alignSelf: "flex-start",
          mt: "auto",
        }}
      >
        Create Audit
      </CommonButton>
      {type === "cycle_count" ? (
        <CreateCycleCountDialog open={open} onClose={() => setOpen(false)} />
      ) : (
        <CreateAuditDialog
          open={open}
          auditType={type}
          onClose={() => setOpen(false)}
        />
      )}
    </Paper>
  );
}
