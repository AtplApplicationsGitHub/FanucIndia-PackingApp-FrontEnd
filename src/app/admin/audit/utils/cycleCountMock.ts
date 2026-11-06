import type {
  AuditListParams,
  AuditListRow,
  AuditOperator,
  AuditPagination,
  AuditStatus,
} from "../types/audit";

/*
 * MOCK Cycle Count backend (the real API is not ready yet).
 * Everything here is frontend only: released audits are kept in sessionStorage
 * and shown in the planning table.
 *
 * When the backend is ready: set USE_MOCK_CYCLE_COUNT = false, call the real API from
 * hooks/useCreateCycleCount.ts, and delete this file.
 */

export const USE_MOCK_CYCLE_COUNT = true;

const STORAGE_KEY = "cycle-count-mock-audits";

const STATUS_LABELS: Record<AuditStatus, string> = {
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RECONCILIATION_PENDING: "Reconciliation Pending",
  CLOSED: "Closed",
};

type ReleasePayload = {
  file: File;
  auditName: string;
  movementFrom: string; // YYYY-MM-DD
  movementTo: string; // YYYY-MM-DD
  binOperators: { storageBin: string; operator: AuditOperator }[];
};

const readStore = (): AuditListRow[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditListRow[]) : [];
  } catch {
    return [];
  }
};

const writeStore = (rows: AuditListRow[]) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* storage unavailable - the mock simply is not kept */
  }
};

const currentUserName = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}").name || "Admin";
  } catch {
    return "Admin";
  }
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Mock of POST /cycle-count: one audit per operator, like BOM. */
export async function releaseMockCycleCount(
  payload: ReleasePayload,
): Promise<{ message: string; audits: AuditListRow[] }> {
  await wait(700);

  const store = readStore();
  let nextId = store.reduce((max, a) => Math.max(max, a.id), 0) + 1;

  // Group the locations by operator
  const byOperator = new Map<number, { operator: AuditOperator; bins: string[] }>();
  for (const { storageBin, operator } of payload.binOperators) {
    const entry = byOperator.get(operator.id) ?? { operator, bins: [] };
    entry.bins.push(storageBin);
    byOperator.set(operator.id, entry);
  }

  const createdBy = currentUserName();
  const createdAt = new Date().toISOString();

  const audits: AuditListRow[] = [...byOperator.values()].map(
    ({ operator, bins }) => {
      const id = nextId++;
      return {
        auditType: "CYCLE_COUNT",
        id,
        auditNo: `CC-${String(id).padStart(5, "0")}`,
        auditName: payload.auditName,
        status: "ASSIGNED",
        statusLabel: STATUS_LABELS.ASSIGNED,
        operatorId: operator.id,
        operatorName: operator.name,
        storageBinCount: bins.length,
        storageBins: bins.map((storageBin, i) => ({
          sequenceNo: i + 1,
          storageBin,
        })),
        createdByName: createdBy,
        createdAt,
        // Mock rows cannot be reassigned / deleted (there is no API behind them)
        actions: { canReassign: false, canDelete: false, canDownloadReport: false },
        details: {
          fileName: payload.file.name,
          movementFrom: payload.movementFrom,
          movementTo: payload.movementTo,
        },
      };
    },
  );

  writeStore([...audits, ...store]);

  return {
    message:
      audits.length === 1
        ? "Cycle Count audit released."
        : `${audits.length} Cycle Count audits released.`,
    audits,
  };
}

const emptyCounts = (): Record<AuditStatus, number> => ({
  ASSIGNED: 0,
  IN_PROGRESS: 0,
  RECONCILIATION_PENDING: 0,
  CLOSED: 0,
});

/** Mock of the planning-table list (search / status / date / page filters). */
export function listMockCycleCounts(params: AuditListParams): {
  data: AuditListRow[];
  pagination: AuditPagination;
  statusCounts: Record<AuditStatus, number>;
} {
  const all = readStore();

  const statusCounts = emptyCounts();
  for (const a of all) {
    if (a.status in statusCounts) statusCounts[a.status as AuditStatus] += 1;
  }

  const search = params.search.trim().toLowerCase();
  const filtered = all.filter((a) => {
    if (params.status && params.status !== "ALL" && a.status !== params.status) {
      return false;
    }
    const day = a.createdAt.slice(0, 10);
    if (params.fromDate && day < params.fromDate) return false;
    if (params.toDate && day > params.toDate) return false;
    if (!search) return true;
    return [a.auditNo, a.auditName, a.operatorName].some((v) =>
      v.toLowerCase().includes(search),
    );
  });

  const start = (params.page - 1) * params.limit;
  return {
    data: filtered.slice(start, start + params.limit),
    pagination: {
      page: params.page,
      limit: params.limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / params.limit),
    },
    statusCounts,
  };
}

/** Mock numbers for the Cycle Count card on the planning page. */
export function getMockCycleCountTotals() {
  const { statusCounts, pagination } = listMockCycleCounts({
    page: 1,
    limit: 1,
    search: "",
    status: "ALL",
  });
  return { total: pagination.total, statusCounts };
}
