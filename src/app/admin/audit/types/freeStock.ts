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
export type FreeStockPagination = { page: number; limit: number; total: number; totalPages: number };
export type FreeStockFilters = { page: number; limit: number; search: string; status: FreeStockStatus | "ALL"; mine: boolean };
export type FreeStockList = { data: FreeStockRow[]; statusCounts: Record<FreeStockStatus, number>; pagination: FreeStockPagination };
export type FreeStockUpload = {
  id: number; fileName: string; uploadedByName: string; status: "PROCESSING" | "COMPLETED" | "FAILED";
  totalRows: number; insertedRows: number; updatedRows: number; closedRows: number;
  errorMessage: string | null; createdAt: string; completedAt: string | null;
};
export type FreeStockHistory = {
  id: number; reservedQty: string; soNumber: string | null; reservedByName: string; reservedZoneName: string;
  reservedAt: string; releasedAt: string | null; releasedByName: string | null; closedAt: string | null;
};
export type ReservationLine = { materialCode: string; batch: string; qty: string; soNumber?: string };
export type StockPreview = {
  totalRows: number; insertedRows: number; updatedRows: number; wouldCloseRows: number;
  sample: { materialCode: string; batch: string; stockQty: string }[];
};
export type ReservationPreview = {
  totalRows: number;
  lines: { rowNo: number; stockItemId: number; materialCode: string; batch: string; qty: string; stockQty: string; soNumber: string | null }[];
};
export type FreeStockColumn = { key: keyof FreeStockRow; label: string; date?: boolean; timestamp?: boolean };
