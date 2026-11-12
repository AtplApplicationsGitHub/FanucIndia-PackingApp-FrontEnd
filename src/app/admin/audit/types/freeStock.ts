export type FreeStockStatus = "OPEN" | "RESERVED" | "CLOSED";
export type FreeStockRole = "ADMIN" | "SALES";
export type FreeStockRow = {
  id: number;
  status: FreeStockStatus;
  storageType: string | null;
  storageBin: string | null;
  materialCode: string;
  plant: string | null;
  storageLocation: string | null;
  availableQty: string | null;
  batch: string;
  stockQty: string;
  certificateNo: string | null;
  grDate: string | null;
  grNumber: string | null;
  delivery: string | null;
  lastMovementDate: string | null;
  lastChanger: string | null;
  reservation: string | null;
  reservationId: number | null;
  reservedQty: string | null;
  soNumber: string | null;
  name: string | null;
  zone: string | null;
  reservedById: number | null;
  reservedDate: string | null;
  reservedDays: number | null;
  ageFromGrDays: number | null;
  shortageQty: string | null;
  hasShortage: boolean;
  canReserve: boolean;
  canRelease: boolean;
  createdAt: string;
  closedAt: string | null;
};
export type FreeStockPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
export type FreeStockReservedDays = 'ALL' | '0_30' | '31_90' | 'OVER_90';
export type FreeStockZone = { id: number; name: string };
export type FreeStockFilters = {
  zoneId?: number;
  reservedDays?: FreeStockReservedDays;
  page: number;
  limit: number;
  search: string;
  status: FreeStockStatus | "ALL";
  mine: boolean;
};
export type FreeStockSummaryItem = {
  count: number;
  stockQty: string;
};

export type FreeStockStatusSummary = Record<
  FreeStockStatus | "ALL",
  FreeStockSummaryItem
>;

export type FreeStockList = {
  filterOptions?: { zones: FreeStockZone[] };
  data: FreeStockRow[];
  statusCounts: Record<FreeStockStatus, number>;
  statusSummary: FreeStockStatusSummary;
  myReservations: FreeStockSummaryItem | null;
  pagination: FreeStockPagination;
};
export type FreeStockUpload = {
  id: number;
  fileName: string;
  uploadedByName: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  totalRows: number;
  insertedRows: number;
  updatedRows: number;
  closedRows: number;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};
export type FreeStockHistory = {
  id: number;
  reservedQty: string;
  soNumber: string | null;
  reservedByName: string;
  reservedZoneName: string;
  reservedAt: string;
  releasedAt: string | null;
  releasedByName: string | null;
  closedAt: string | null;
};
export type ReservationLine = {
  storageBin: string;
  materialCode: string;
  batch: string;
  qty: string;
  soNumber?: string;
};
export type StockRowIssue = {
  rowNo: number; storageBin: string; materialCode: string; batch: string;
  column: string; value: string; reason: string;
};
export type StockPreview = {
  validRows: number;
  skippedRows: number;
  protectedRows: number;
  issues: StockRowIssue[];
  canImport: boolean;
  previewToken: string;
  totalRows: number;
  insertedRows: number;
  updatedRows: number;
  wouldCloseRows: number;
  sample: { storageBin: string; materialCode: string; batch: string; stockQty: string }[];
};
export type ReservationPreview = {
  totalRows: number;
  lines: {
    storageBin: string;
    rowNo: number;
    stockItemId: number;
    materialCode: string;
    batch: string;
    qty: string;
    stockQty: string;
    soNumber: string | null;
  }[];
};
export type FreeStockColumn = {
  key: keyof FreeStockRow;
  label: string;
  date?: boolean;
  timestamp?: boolean;
};

/** Bulk allocation uses exact Material+Batch; pending quantities are not SAP shortages. */
export type BulkReservationRow = {
  storageBin: string;
  rowNo: number;
  stockItemId: number | null;
  materialCode: string;
  batch: string;
  qty: string;
  soNumber: string | null;
  stockQty: string;
  allocatedQty: string;
  pendingQty: string;
  status: "ALLOCATED" | "PARTIAL" | "NOT_ALLOCATED";
  remarks: string;
};
export type BulkReservationPreview = {
  totalRows: number;
  sourceFileName?: string;
  previewToken?: string;
  lines: BulkReservationRow[];
  summary: {
    allocated: number; partial: number; notAllocated: number;
    requestedQty: string; allocatedQty: string; pendingQty: string;
  };
  canConfirm: boolean;
};
export type BulkReservationResult = BulkReservationPreview & {
  bulkReservationId: string; reservedAt: string; reservedRows: number;
};
