import { formatDateIST, formatDateTimeIST } from "@/common/utils/dateTime";
import { FREE_STOCK_COLUMNS } from "./freeStockColumns";
import type { FreeStockRow } from "../../types/freeStock";
export function stockCell(row: FreeStockRow, column: (typeof FREE_STOCK_COLUMNS)[number]): string {
  const value = row[column.key];
  if (value === null || value === undefined || value === "") return "—";
  if (column.timestamp) return formatDateTimeIST(String(value));
  if (column.date) return formatDateIST(String(value));
  return String(value);
}
