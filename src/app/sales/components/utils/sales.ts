import { LookupRow } from "@/app/admin/components/types/admin";
import { formatDateIST } from "@/common/utils/dateTime";

export function getGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      hour12: false,
    }).format(new Date())
  );

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatDate(iso?: string) {
  return formatDateIST(iso);
}

export function findName(
  arr: LookupRow[],
  id: number,
  field = "name"
): string {
  const item = arr.find(x => x.id === id);
  const value = item?.[field];
  return typeof value === "string" ? value : "-";
}
