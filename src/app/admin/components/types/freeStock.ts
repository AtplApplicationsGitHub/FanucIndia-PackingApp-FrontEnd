export const FREE_STOCK_COLUMNS = [
  "Typ", "StorageBin", "Material", "Plnt", "Location", "Avail",
  "Batch", "Stock", "Cert. No.", "GR Date", "GR Number", "Delivery",
  "Last mvmt", "Last changer",
] as const;

export type FreeStockColumn = (typeof FREE_STOCK_COLUMNS)[number];

export type FreeStockRow = Record<FreeStockColumn, string | number> & {
  id: string;
  status: "Open" | "Closed";
  heldBy: string;
  heldQty: number;
  daysHeld: number | null;
  isNew?: boolean;
};
