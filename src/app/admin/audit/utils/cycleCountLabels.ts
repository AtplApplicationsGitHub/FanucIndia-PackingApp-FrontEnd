import type { ChipProps } from "@mui/material";
import type {
  CncFilter,
  MovementLevel,
  SelectionMethod,
} from "../types/cycleCount";

/* Cycle Count labels / colours (same values as the backend cycle-count.constants.ts). */

export const SELECTION_METHOD_LABELS: Record<SelectionMethod, string> = {
  BUSIEST: "Busiest first",
  RANDOM: "Random",
  MANUAL: "Manual",
};

export const CNC_FILTER_LABELS: Record<CncFilter, string> = {
  BOTH: "Both",
  WITH_CNC: "With CNC",
  WITHOUT_CNC: "Without CNC",
};

export const MOVEMENT_LEVEL_LABELS: Record<MovementLevel, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  NONE: "No movement",
};

export function movementLevelColor(level: string): ChipProps["color"] {
  switch (level) {
    case "HIGH":
      return "error";
    case "MEDIUM":
      return "warning";
    case "LOW":
      return "info";
    default:
      return "default";
  }
}

/** "2026-10-26" -> "26 Oct 2026" (date-only value, no time zone shift). */
export function formatDateOnly(value: string): string {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Today / N days ago as YYYY-MM-DD in the browser's local date. */
export function localYmd(daysAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
