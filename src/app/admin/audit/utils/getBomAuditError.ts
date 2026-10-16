// BE error body: { code, message (string | string[]), errors?: [{ rowNo, errors[] }] }
export function getBomAuditError(json: any, fallback: string): string {
  const parts: string[] = [];
  if (Array.isArray(json?.message)) parts.push(...json.message.map(String));
  else if (json?.message) parts.push(String(json.message));
  if (Array.isArray(json?.errors)) {
    parts.push(
      ...json.errors.map(
        (e: { rowNo?: number; errors?: string[] }) =>
          `Row ${e.rowNo}: ${(e.errors ?? []).join(", ")}`,
      ),
    );
  }
  return parts.join("\n") || fallback;
}
