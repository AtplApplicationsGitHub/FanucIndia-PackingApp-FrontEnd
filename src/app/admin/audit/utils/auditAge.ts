const DAY_MS = 86_400_000;

export const STALE_AFTER_DAYS = 3;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export function getAgeInDays(createdAt: string): number {
  const diff = startOfDay(new Date()) - startOfDay(new Date(createdAt));

  return Math.max(0, Math.round(diff / DAY_MS));
}

export function formatAge(days: number): string {
  return days === 0 ? "Today" : `${days}d`;
}
