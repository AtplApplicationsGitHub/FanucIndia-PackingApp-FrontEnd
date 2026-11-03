"use client";

import AuditTableDialog from "../shared/AuditTableDialog";
import type { AuditOperator } from "../../types/audit";

type Props = {
  open: boolean;
  operators: AuditOperator[];
  loading: boolean;
  onClose: () => void;
};

export default function OperatorListDialog({
  open,
  operators,
  loading,
  onClose,
}: Props) {
  return (
    <AuditTableDialog
      open={open}
      title="OPERATORS"
      showSerialNumber={false}
      showTotalCount
      columns={[
        { label: "User ID", align: "left", width: 100 },
        { label: "Name", width: 120 },
        { label: "Email", width: 120 },
      ]}
      rows={operators.map((o) => [o.id, o.name, o.email])}
      emptyText={loading ? "Loading operators..." : "No operators found."}
      onClose={onClose}
    />
  );
}
