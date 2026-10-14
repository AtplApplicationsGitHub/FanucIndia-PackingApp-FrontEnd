export type AuditType = "cycle_count" | "bom" | "location" | "free_stock";

export type AuditStatus = "Assigned" | "Completed";

export type AuditRow = {
  storage: string;
  materialCode: string;
  quantity: number;
  excelRow: number;
};

export type AuditPlan = {
  id: string;
  name: string;
  type: AuditType;
  operator: string;
  fileName: string;
  createdAt: string;
  status: AuditStatus;
  rows: AuditRow[];
};
