export function formatDateLocalYYYYMMDD(date: Date | undefined): string | undefined {
  if (!date) return undefined;
  
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
