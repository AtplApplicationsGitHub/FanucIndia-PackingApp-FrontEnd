/**
 * MOCK DATA ONLY - remove this file when the reconciliation API is ready.
 * The hooks in ../hooks are the only consumers; swap their bodies for
 * fetchWithAuth calls and nothing else in the UI needs to change.
 *
 * Shape follows the real BOM audit flow:
 *  - one uploaded file creates ONE AUDIT PER OPERATOR (same fileName / uploadBatchId)
 *  - the operator submits the whole audit from the handheld -> PENDING_RECONCILIATION
 *  - every BomAuditMaterial line has expectedQty / actualQty; a variance is a line that is
 *    MISSING, UNEXPECTED (excess) or MISMATCH (quantity) - VALID lines are never listed.
 */
import { getAgeInDays } from "../utils/auditAge";
import { getAccuracy, ISSUE_ORDER, isActiveStatus } from "../utils/reconLabels";
import type {
  ReconAuditDetail,
  ReconAuditStatus,
  ReconAuditSummary,
  ReconDecision,
  ReconIssueType,
  ReconSapAction,
  ReconStats,
  ReconVariance,
} from "../types/reconciliation";

const isoDaysAgo = (days: number, hour = 11, minute = 20) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);

  return d.toISOString();
};

// [materialCode, expectedQty, scannedQty]  (expectedQty 0 = not in the audit file => excess)
type LineSeed = [materialCode: string, expectedQty: number, scannedQty: number];

type AuditSeed = {
  auditNo: string;
  auditName: string;
  operatorName: string;
  fileName: string;
  daysAgo: number;
  status: ReconAuditStatus;
  resolvedCount: number; // only used for IN_PROGRESS
  bins: Record<string, LineSeed[]>;
};

const DECISIONS: ReconDecision[] = [
  "CORRECT_SYSTEM_RECORD",
  "CORRECT_PHYSICAL_STOCK",
];

const SEEDS: AuditSeed[] = [
  {
    // Same file -> three audits, one per operator (as the upload creates them)
    auditNo: "AUD-BOM-0014",
    auditName: "Rack 16 BOM Audit",
    operatorName: "Suresh M",
    fileName: "rack16_plan.xlsx",
    daysAgo: 0,
    status: "PENDING_RECONCILIATION",
    resolvedCount: 0,
    bins: {
      "16-E-32": [
        ["A06B-6114-H105", 4, 4],
        ["A20B-2100-0761", 6, 3],
      ],
      "16-F-32": [
        ["A02B-0323-B500", 2, 0],
        ["A860-2010-T301", 5, 5],
        ["A05B-2600-J100", 0, 2],
      ],
    },
  },
  {
    auditNo: "AUD-BOM-0013",
    auditName: "Rack 16 BOM Audit",
    operatorName: "Anitha S",
    fileName: "rack16_plan.xlsx",
    daysAgo: 0,
    status: "PENDING_RECONCILIATION",
    resolvedCount: 0,
    bins: {
      "16-C-32": [
        ["A06B-0116-B075", 10, 10],
        ["A16B-3200-0420", 8, 6],
      ],
      "16-D-32": [
        ["A14B-0076-B103", 3, 3],
        ["A06B-6114-H105", 0, 1],
      ],
    },
  },
  {
    auditNo: "AUD-BOM-0012",
    auditName: "Rack 16 BOM Audit",
    operatorName: "Rajesh Kumar",
    fileName: "rack16_plan.xlsx",
    daysAgo: 1,
    status: "IN_PROGRESS",
    resolvedCount: 2,
    bins: {
      "16-A-32": [
        ["A06B-6114-H105", 4, 2],
        ["A20B-2100-0761", 1, 3],
        ["A02B-0323-B500", 2, 2],
      ],
      "16-B-32": [
        ["A860-2010-T301", 3, 0],
        ["A05B-2600-J100", 12, 12],
        ["A16B-3200-0420", 0, 1],
      ],
    },
  },
  {
    auditNo: "AUD-BOM-0011",
    auditName: "Spindle Motor BOM - Zone B",
    operatorName: "Priya R",
    fileName: "bom_zone_b.xlsx",
    daysAgo: 3,
    status: "PENDING_RECONCILIATION",
    resolvedCount: 0,
    bins: {
      "19-A-21": [
        ["A06B-0116-B075", 2, 1],
        ["A06B-6114-H105", 5, 5],
      ],
      "19-C-14": [
        ["A02B-0323-B500", 2, 0],
        ["A20B-2100-0761", 0, 1],
        ["A860-2010-T301", 7, 7],
      ],
    },
  },
  {
    auditNo: "AUD-BOM-0010",
    auditName: "Encoder Cable Sets - Line 1",
    operatorName: "Rajesh Kumar",
    fileName: "bom_line1_cables.xlsx",
    daysAgo: 6,
    status: "RECONCILED",
    resolvedCount: 0,
    bins: {
      "16-F-31": [
        ["A05B-2600-J100", 3, 1],
        ["A16B-3200-0420", 2, 2],
      ],
      "16-D-02": [["A14B-0076-B103", 4, 4]],
    },
  },
  {
    auditNo: "AUD-BOM-0009",
    auditName: "Power Supply Kits - Zone A",
    operatorName: "Anitha S",
    fileName: "bom_zone_a.xlsx",
    daysAgo: 9,
    status: "CLOSED",
    resolvedCount: 0,
    bins: {
      "18-A-08": [
        ["A860-2010-T301", 3, 2],
        ["A06B-6114-H105", 6, 6],
      ],
    },
  },
  {
    auditNo: "AUD-BOM-0008",
    auditName: "Teach Pendant Packages",
    operatorName: "Suresh M",
    fileName: "bom_pendant.xlsx",
    daysAgo: 12,
    status: "CLOSED",
    resolvedCount: 0,
    bins: {
      "17-B-05": [
        ["A02B-0323-B500", 2, 2],
        ["A20B-2100-0761", 1, 0],
        ["A14B-0076-B103", 0, 2],
      ],
    },
  },
];

const classify = (expected: number, scanned: number): ReconIssueType | null => {
  if (expected === 0 && scanned > 0) return "EXCESS";
  if (expected > 0 && scanned === 0) return "MISSING";
  if (expected !== scanned) return "QUANTITY_MISMATCH";

  return null; // VALID
};

function buildAudit(seed: AuditSeed, index: number): ReconAuditDetail {
  const id = index + 1;
  const uploadedAt = isoDaysAgo(seed.daysAgo);
  const resolvedAt = isoDaysAgo(Math.max(seed.daysAgo - 1, 0), 15, 40);
  const allResolved = seed.status === "RECONCILED" || seed.status === "CLOSED";

  let expected = 0;
  let scanned = 0;
  let matched = 0;
  const variances: ReconVariance[] = [];

  Object.entries(seed.bins).forEach(([storageBin, lines]) => {
    lines.forEach(([materialCode, expectedQty, scannedQty]) => {
      if (expectedQty > 0) expected += 1;
      if (scannedQty > 0) scanned += 1;

      const issueType = classify(expectedQty, scannedQty);

      if (!issueType) {
        matched += 1;

        return;
      }

      const i = variances.length;
      const resolved = allResolved || i < seed.resolvedCount;

      variances.push({
        id: id * 100 + i + 1,
        storageBin,
        materialCode,
        expectedQty,
        scannedQty,
        issueType,
        status: resolved ? "RESOLVED" : "OPEN",
        decision: resolved ? DECISIONS[i % DECISIONS.length] : null,
        sapAction: "NONE",
        remarks: resolved ? "Verified with warehouse head." : "",
        scannedAt: uploadedAt,
        resolvedAt: resolved ? resolvedAt : null,
        resolvedByName: resolved ? "Warehouse Head" : null,
      });
    });
  });

  const closed = seed.status === "CLOSED";

  return {
    id,
    auditNo: seed.auditNo,
    auditName: seed.auditName,
    operatorName: seed.operatorName,
    fileName: seed.fileName,
    uploadedAt,
    totalLocations: Object.keys(seed.bins).length,
    expectedComponents: expected,
    scannedComponents: scanned,
    matchedComponents: matched,
    totalVariances: variances.length,
    openVariances: variances.filter((v) => v.status === "OPEN").length,
    status: seed.status,
    closedAt: closed ? resolvedAt : null,
    closedByName: closed ? "Warehouse Head" : null,
    variances,
  };
}

let store: ReconAuditDetail[] | null = null;

const getStore = () => {
  if (!store) store = SEEDS.map(buildAudit);

  return store;
};

const notify = () => window.dispatchEvent(new Event("reconciliation-updated"));

const toSummary = (audit: ReconAuditDetail): ReconAuditSummary => {
  const { variances, closedAt, closedByName, ...summary } = audit;
  void closedAt;
  void closedByName;

  return {
    ...summary,
    totalVariances: variances.length,
    openVariances: variances.filter((v) => v.status === "OPEN").length,
  };
};

export function listReconAudits(): ReconAuditSummary[] {
  const all = getStore().map(toSummary);
  const active = all
    .filter((a) => isActiveStatus(a.status))
    .sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt)); // oldest waiting first
  const done = all
    .filter((a) => !isActiveStatus(a.status))
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

  return [...active, ...done];
}

export function getReconAudit(id: number): ReconAuditDetail | null {
  const audit = getStore().find((a) => a.id === id);

  return audit
    ? { ...audit, variances: audit.variances.map((v) => ({ ...v })) }
    : null;
}

export const EMPTY_RECON_STATS: ReconStats = {
  totalAudits: 0,
  pendingCount: 0,
  oldestPendingDays: 0,
  inProgressCount: 0,
  inProgressResolved: 0,
  inProgressTotal: 0,
  openVariances: 0,
  openVarianceAudits: 0,
  accuracy: 0,
  matchedComponents: 0,
  expectedComponents: 0,
  openByIssue: { MISSING: 0, EXCESS: 0, QUANTITY_MISMATCH: 0 },
};

export function getReconStats(): ReconStats {
  const audits = getStore();
  const pending = audits.filter((a) => a.status === "PENDING_RECONCILIATION");
  const inProgress = audits.filter((a) => a.status === "IN_PROGRESS");
  const openByIssue = { ...EMPTY_RECON_STATS.openByIssue };

  audits.forEach((a) =>
    a.variances.forEach((v) => {
      if (v.status === "OPEN") openByIssue[v.issueType] += 1;
    }),
  );

  const expected = audits.reduce((n, a) => n + a.expectedComponents, 0);
  const matched = audits.reduce((n, a) => n + a.matchedComponents, 0);

  return {
    totalAudits: audits.length,
    pendingCount: pending.length,
    oldestPendingDays: Math.max(
      0,
      ...pending.map((a) => getAgeInDays(a.uploadedAt)),
    ),
    inProgressCount: inProgress.length,
    inProgressResolved: inProgress.reduce(
      (n, a) => n + a.variances.filter((v) => v.status === "RESOLVED").length,
      0,
    ),
    inProgressTotal: inProgress.reduce((n, a) => n + a.variances.length, 0),
    openVariances: ISSUE_ORDER.reduce((n, t) => n + openByIssue[t], 0),
    openVarianceAudits: audits.filter((a) =>
      a.variances.some((v) => v.status === "OPEN"),
    ).length,
    accuracy: getAccuracy(matched, expected),
    matchedComponents: matched,
    expectedComponents: expected,
    openByIssue,
  };
}

export function saveVarianceDecision(
  auditId: number,
  varianceId: number,
  decision: ReconDecision,
  sapAction: ReconSapAction,
  remarks: string,
  userName: string,
) {
  const audit = getStore().find((a) => a.id === auditId);

  if (!audit) throw new Error("Audit not found.");
  if (audit.status === "CLOSED")
    throw new Error("This audit is already closed.");

  const variance = audit.variances.find((v) => v.id === varianceId);

  if (!variance) throw new Error("Discrepancy not found.");
  if (!remarks.trim()) throw new Error("Remarks are required.");

  variance.status = "RESOLVED";
  variance.decision = decision;
  variance.sapAction = sapAction;
  variance.remarks = remarks;
  variance.resolvedAt = new Date().toISOString();
  variance.resolvedByName = userName;

  const open = audit.variances.filter((v) => v.status === "OPEN").length;

  audit.status = open === 0 ? "RECONCILED" : "IN_PROGRESS";
  audit.openVariances = open;
  notify();
}

export function closeReconAudit(auditId: number, userName: string) {
  const audit = getStore().find((a) => a.id === auditId);

  if (!audit) throw new Error("Audit not found.");
  if (audit.status !== "RECONCILED") {
    throw new Error("Only reconciled audits can be closed.");
  }
  if (audit.variances.some((v) => v.status === "OPEN")) {
    throw new Error("Resolve all discrepancies before closing the audit.");
  }

  audit.status = "CLOSED";
  audit.closedAt = new Date().toISOString();
  audit.closedByName = userName;
  notify();
}
export type ReconReverification = {
  id: number;
  auditId: number;
  storageBin: string;
  operatorId: number;
  operatorName: string;
  assignedAt: string;
};

const reverifications: ReconReverification[] = [];

export function assignBinReverification(
  auditId: number,
  storageBin: string,
  operatorId: number,
  operatorName: string,
) {
  const audit = getStore().find((a) => a.id === auditId);

  if (!audit) throw new Error("Audit not found.");
  if (audit.status === "CLOSED")
    throw new Error("This audit is already closed.");
  if (
    audit.variances.some(
      (v) => v.storageBin === storageBin && v.status === "OPEN",
    )
  ) {
    throw new Error("Resolve all discrepancies in this bin first.");
  }

  reverifications.push({
    id: reverifications.length + 1,
    auditId,
    storageBin,
    operatorId,
    operatorName,
    assignedAt: new Date().toISOString(),
  });
  notify();
}
export function listBinReverifications(auditId: number): ReconReverification[] {
  return reverifications.filter((r) => r.auditId === auditId);
}
