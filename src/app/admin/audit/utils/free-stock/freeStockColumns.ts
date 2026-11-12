import type { FreeStockColumn } from "../../types/freeStock";
export const FREE_STOCK_COLUMNS: FreeStockColumn[] = [
  { key: "storageType", label: "Typ" },
  { key: "storageBin", label: "Storage Bin" },
  { key: "materialCode", label: "Material" },
  { key: "plant", label: "Plant" },
  { key: "storageLocation", label: "Location" },
  { key: "availableQty", label: "Avail" },
  { key: "batch", label: "Batch" },
  { key: "stockQty", label: "Stock" },
  { key: "certificateNo", label: "Cert. No." },
  { key: "grDate", label: "GR Date", date: true },
  { key: "grNumber", label: "GR Number" },
  { key: "delivery", label: "Delivery" },
  { key: "lastMovementDate", label: "Last Movement", date: true },
  { key: "lastChanger", label: "Last Changer" },
  { key: "reservation", label: "Reservation" },
  { key: "reservedQty", label: "Reserved Qty" },
  { key: "soNumber", label: "SO Number" },
  { key: "name", label: "Reserved By" },
  { key: "zone", label: "Zone" },
  { key: "reservedDate", label: "Reserved Date", timestamp: true },
  { key: "reservedDays", label: "Reserved Days" },
  { key: "ageFromGrDays", label: "Age from GR (Days)" },
  { key: "shortageQty", label: "Shortage Qty" },
];

// Main table only. Keep FREE_STOCK_COLUMNS complete for details and exports.
// These widths total 93%; the Actions column uses the remaining 7%.
export const FREE_STOCK_TABLE_COLUMNS: (FreeStockColumn & { width: string })[] = [
  { key: "storageBin", label: "Bin", width: "6%" },
  { key: "materialCode", label: "Material", width: "10%" },
  { key: "batch", label: "Batch", width: "8%" },
  { key: "certificateNo", label: "Cert. No.", width: "8%" },
  { key: "grDate", label: "GR Date / Age", date: true, width: "10%" },
  { key: "reservedDate", label: "Reserved Date / Days", date: true, width: "10%" },
  { key: "status", label: "Status", width: "8%" },
  { key: "stockQty", label: "Stock", width: "5%" },
  { key: "reservedQty", label: "Reserved Qty", width: "7%" },
  { key: "name", label: "Reserved By / Zone", width: "10%" },
  { key: "shortageQty", label: "Shortage Qty", width: "11%" },
];
