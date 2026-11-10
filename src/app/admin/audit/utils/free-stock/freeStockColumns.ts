import type { FreeStockColumn } from "../../types/freeStock";
export const FREE_STOCK_COLUMNS: FreeStockColumn[] = [
  { key: "storageType", label: "Typ" }, { key: "storageBin", label: "Storage Bin" },
  { key: "materialCode", label: "Material" }, { key: "plant", label: "Plant" },
  { key: "storageLocation", label: "Location" }, { key: "availableQty", label: "Avail" },
  { key: "batch", label: "Batch" }, { key: "stockQty", label: "Stock" },
  { key: "certificateNo", label: "Cert. No." }, { key: "grDate", label: "GR Date", date: true },
  { key: "grNumber", label: "GR Number" }, { key: "delivery", label: "Delivery" },
  { key: "lastMovementDate", label: "Last Movement", date: true }, { key: "lastChanger", label: "Last Changer" },
  { key: "reservation", label: "Reservation" }, { key: "reservedQty", label: "Reserved Qty" },
  { key: "soNumber", label: "SO Number" }, { key: "name", label: "Name" },
  { key: "zone", label: "Zone" }, { key: "reservedDate", label: "Reserved Date", timestamp: true },
  { key: "reservedDays", label: "Reserved Days" }, { key: "ageFromGrDays", label: "Age from GR (Days)" },
  { key: "shortageQty", label: "Shortage Qty" },
];

export const FREE_STOCK_TABLE_COLUMNS: FreeStockColumn[] = [
  { key: "storageBin", label: "Storage Bin" },
  { key: "materialCode", label: "Material" },
  { key: "batch", label: "Batch" },
  { key: "stockQty", label: "Stock" },
  { key: "status", label: "Status" },
  { key: "name", label: "Name" },
  { key: "reservation", label: "Reservation" },
  { key: "reservedQty", label: "Reserved Qty" },
  { key: "reservedDays", label: "Reserved Days" },
  { key: "ageFromGrDays", label: "Age from GR (Days)" },
];
