"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";

import { Alert, Box, CircularProgress } from "@mui/material";

import CommonButton from "@/common/components/CommonButton";
import AuditProgressDetail from "./AuditProgressDetail";
import ReconciliationDetailScreen from "./ReconciliationDetailScreen";
import { useAuditDetailView } from "../../hooks/useAuditDetailView";
import { useDownloadBomReport } from "../../hooks/useDownloadBomReport";
import {
  isPlanningTab,
  planningRoute,
  type PlanningTab,
} from "../../utils/auditRoutes";

const RECONCILIATION_API_READY = false;

export default function AuditDetailScreen() {
  const searchParams = useSearchParams();
  const { auditId } = useParams<{ auditId: string }>();
  const type = searchParams.get("type");
  const id = Number(auditId);

  if (!isPlanningTab(type)) return <ReconciliationDetailScreen />;

  return <PlanningAuditDetail auditType={type} auditId={id} />;
}

function PlanningAuditDetail({
  auditType,
  auditId,
}: {
  auditType: PlanningTab;
  auditId: number;
}) {
  const router = useRouter();
  const { view, loading, error } = useAuditDetailView(auditType, auditId);
  const { downloadReport, loading: downloading } = useDownloadBomReport();

  const backToPlanning = () => router.push(planningRoute(auditType));

  if (!Number.isInteger(auditId) || auditId <= 0) {
    return <ErrorState message="Invalid audit." onBack={backToPlanning} />;
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !view) {
    return (
      <ErrorState
        message={error || "Audit not found."}
        onBack={backToPlanning}
      />
    );
  }

  const reconciled =
    view.status === "RECONCILIATION_PENDING" || view.status === "CLOSED";

  if (auditType === "bom" && reconciled && RECONCILIATION_API_READY) {
    return <ReconciliationDetailScreen />;
  }

  return (
    <AuditProgressDetail
      auditType={auditType}
      view={view}
      onBack={backToPlanning}
      onDownloadReport={
        auditType === "bom" && view.submittedAt
          ? () => downloadReport(auditId, view.auditNo)
          : undefined
      }
      downloading={downloading}
    />
  );
}

function ErrorState({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Alert severity="error">{message}</Alert>
      <CommonButton sx={{ alignSelf: "flex-start" }} onClick={onBack}>
        BACK TO PLANNING
      </CommonButton>
    </Box>
  );
}
