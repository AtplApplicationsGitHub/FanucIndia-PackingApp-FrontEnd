import { format, parseISO } from "date-fns";
import { LookupRow } from "@/app/admin/components/types/admin";

export function findName(
  arr: LookupRow[],
  id?: number,
  field = "name"
): string {
  if (!id) return "-";
  const item = arr.find(x => x.id === id);
  const value = item?.[field];
  return typeof value === "string" ? value : "-";
}

export function formatDate(iso?: string) {
  try {
    return iso ? format(parseISO(iso), "dd-MMM-yyyy") : "-";
  } catch {
    return "-";
  }
}

export function formatDateDMY(iso?: string) {
  try {
    return iso ? format(parseISO(iso), "dd-MM-yyyy") : "-";
  } catch {
    return "-";
  }
}
