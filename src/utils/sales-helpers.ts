import { format, parseISO } from "date-fns";
import { LookupRow } from "@/types/admin"; 

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatDate(iso: string) {
  try {
    return format(parseISO(iso), "dd-MMM-yyyy"); 
  } catch {
    return "-";
  }
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
