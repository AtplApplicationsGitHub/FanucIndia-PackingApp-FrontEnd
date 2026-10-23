"use client";

import { Box } from "@mui/material";
import { AlertTriangle, ClipboardList, RefreshCw, Files } from "lucide-react";
import ReconMetricCard from "./ReconMetricCard";
import type { ReconStats } from "../../types/reconciliation";

export default function ReconStatCards({ stats }: { stats: ReconStats }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: 2,
      }}
    >
      <ReconMetricCard
        title="Total Audits"
        value={stats.totalAudits}
        icon={<Files size={18} />}
        caption="Total audits recorded"
      />
      <ReconMetricCard
        title="Pending Reconciliation"
        value={stats.pendingCount}
        icon={<ClipboardList size={18} />}
        caption={
          stats.pendingCount === 0
            ? "Nothing waiting"
            : `Oldest waiting ${stats.oldestPendingDays === 0 ? "since today" : `${stats.oldestPendingDays}d`}`
        }
      />

      <ReconMetricCard
        title="In Progress"
        value={stats.inProgressCount}
        icon={<RefreshCw size={18} />}
        progress={
          stats.inProgressTotal
            ? (stats.inProgressResolved / stats.inProgressTotal) * 100
            : 0
        }
        progressColor="info"
        caption={`${stats.inProgressResolved} of ${stats.inProgressTotal} variances resolved`}
      />

      <ReconMetricCard
        title="Open Variances"
        value={stats.openVariances}
        icon={<AlertTriangle size={18} />}
        caption={`Across ${stats.openVarianceAudits} audit${stats.openVarianceAudits === 1 ? "" : "s"}`}
      />
    </Box>
  );
}
