"use client";

import { Box } from "@mui/material";

import IssueBreakdown from "./IssueBreakdown";
import ReconAuditsTable from "./ReconAuditsTable";
import ReconStatCards from "./ReconStatCards";
import { useReconciliationAudits } from "../../hooks/useReconciliationAudits";

export default function ReconciliationScreen() {
  const { audits, pagination, stats, params, loading, updateParams } =
    useReconciliationAudits();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, gap: 2 }}>
      <ReconStatCards stats={stats} />

      <IssueBreakdown counts={stats.openByIssue} />

      <ReconAuditsTable
        audits={audits}
        pagination={pagination}
        params={params}
        loading={loading}
        updateParams={updateParams}
      />
    </Box>
  );
}
