import { Suspense } from "react";

import AuditDetailScreen from "../../../components/reconciliation/AuditDetailScreen";

export default function AuditViewPage() {
  return (
    <Suspense fallback={null}>
      <AuditDetailScreen />
    </Suspense>
  );
}
