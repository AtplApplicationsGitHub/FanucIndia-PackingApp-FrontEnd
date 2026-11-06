import type { FreeStockRow } from "../types/freeStock";

// Frontend-only sample data copied from the approved HTML prototype.
// Do not import APIs, hooks, or persistence into this mock module.
const stockPairs = [[6, 6], [6, 4], [6, 2], [6, 6], [6, 6], [6, 6], [6, 6], [3, 3], [6, 6]];
const holds: Record<number, { user: string; quantity: number; days: number }> = {
  1: { user: "Ravi", quantity: 3, days: 14 },
  2: { user: "Anita", quantity: 2, days: 8 },
  7: { user: "Suresh", quantity: 2, days: 2 },
};

export const INITIAL_FREE_STOCK_ROWS: FreeStockRow[] = stockPairs.map(([avail, stock], index) => {
  const batch = `YD${20872 + index}-26`;
  const hold = holds[index];
  return {
    id: `mock-${index + 1}`,
    Typ: "FR1",
    StorageBin: "A2",
    Material: "A02B-0120-K301",
    Plnt: "R107",
    Location: "1100",
    Avail: avail,
    Batch: batch,
    Stock: stock,
    "Cert. No.": batch,
    "GR Date": "22.05.2026",
    "GR Number": index < 5 ? "4900603214" : "4900603230",
    Delivery: "",
    "Last mvmt": "04.11.2026",
    "Last changer": "10006325",
    status: "Open",
    heldBy: hold?.user ?? "",
    heldQty: hold?.quantity ?? 0,
    daysHeld: hold?.days ?? null,
  };
});

export const FREE_STOCK_MOCK_LAST_UPLOAD = "06 Nov 2026, 09:12 · Sample_freestock.xlsx";
