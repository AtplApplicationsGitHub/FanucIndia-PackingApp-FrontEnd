import { LookupRow } from "@/app/admin/components/types/admin";
import { formatDateIST, formatDateTimeIST } from "@/common/utils/dateTime";

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
  return formatDateIST(iso);
}

export function formatDateDMY(iso?: string) {
  return formatDateIST(iso);
}

export function formatDateTime(iso?: string) {
  return formatDateTimeIST(iso);
}
