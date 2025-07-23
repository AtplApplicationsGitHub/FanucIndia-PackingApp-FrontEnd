// src/utils/admin-helper.ts
import { format, parseISO } from "date-fns";

// Find readable name for lookup fields (products, transporters, etc.)
export function findName(
  arr: Array<{ id: number } & Record<string, any>>,
  id?: number,
  field = "name"
): string {
  if (!id) return "-";
  const item = arr.find(x => x.id === id);
  const value = item?.[field];
  return typeof value === "string" ? value : "-";
}

// Format ISO date to dd-MMM-yyyy (ex: 22-Jul-2025)
export function formatDate(iso?: string) {
  try {
    return iso ? format(parseISO(iso), "dd-MMM-yyyy") : "-";
  } catch {
    return "-";
  }
}

// Format ISO date to dd-MM-yyyy (ex: 22-07-2025) for admin display
export function formatDateDMY(iso?: string) {
  try {
    return iso ? format(parseISO(iso), "dd-MM-yyyy") : "-";
  } catch {
    return "-";
  }
}
