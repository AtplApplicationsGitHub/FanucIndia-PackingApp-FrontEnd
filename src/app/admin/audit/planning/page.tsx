import { Suspense } from "react";

import AuditPlanning from "../components/planning/AuditPlanning";

export default function AuditPlanningPage() {
  return (
    <Suspense fallback={null}>
      <AuditPlanning />
    </Suspense>
  );
}
