export class FreeStockApiError extends Error {
  constructor(message: string, public readonly details: string[] = []) { super(message); }
}
export async function checked(response: Response): Promise<Response> {
  if (response.ok) return response;
  const body: { message?: string | string[]; errors?: { rowNo?: number; stockItemId?: number; message?: string; errors?: string[] }[]; totalErrors?: number } = await response.json().catch(() => ({}));
  const details = (body.errors ?? []).map((row) => `${row.rowNo ? `Row ${row.rowNo}: ` : row.stockItemId ? `Item ${row.stockItemId}: ` : ""}${row.message ?? row.errors?.join(", ") ?? "Invalid row"}`);
  if (body.totalErrors && body.totalErrors > details.length) details.push(`${body.totalErrors - details.length} additional errors.`);
  throw new FreeStockApiError(Array.isArray(body.message) ? body.message.join(" ") : body.message || `Request failed (${response.status}).`, details);
}
