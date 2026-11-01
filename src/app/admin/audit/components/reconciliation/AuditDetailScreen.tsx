"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";

import { Alert, Box, CircularProgress } from "@mui/material";

import CommonButton from "@/common/components/CommonButton";
import AuditProgressDetail from "./AuditProgressDetail";
import { useAuditDetailView } from "../../hooks/useAuditDetailView";
import {
  isPlanningTab,
  planningRoute,
  type PlanningTab,
} from "../../utils/auditRoutes";

export default function AuditDetailScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auditId } = useParams<{ auditId: string }>();
  const type = searchParams.get("type");
  const id = Number(auditId);

  if (!isPlanningTab(type)) {
    return (
      <ErrorState
        message="Invalid audit link."
        onBack={() => router.push(planningRoute())}
      />
    );
  }

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

  return (
    <AuditProgressDetail
      auditType={auditType}
      auditId={auditId}
      view={view}
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
