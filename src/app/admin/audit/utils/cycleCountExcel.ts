import type { AuditRow } from "../types/audit";

/*
 * Cycle Count Excel parser (runs in the browser - the backend is not ready yet).
 * Same template as BOM: Location, Qty, Material (+ optional Operator ID).
 *
 * The SAP stock export has "StorageBin", "Material", "Stock"/"Avail" and a "Location"
 * column that holds the plant storage location (e.g. 1100), NOT the bin. So every field
 * lists its accepted headers in PRIORITY order: when several are present, the first wins
 * (StorageBin beats Location, Qty/Stock beat Avail).
 */

const HEADER_ALIASES = {
  location: ["storagebin", "location", "bin"],
  quantity: ["qty", "quantity", "stock", "avail"],
  material: ["material", "materialcode"],
  operator: ["operatorid", "userid"],
} as const;

type Column = keyof typeof HEADER_ALIASES;

export type ParsedCycleCountFile = {
  /** One row per distinct (location + material); duplicates are merged (qty added) */
  rows: AuditRow[];
  /** Operator ID written in the file for a location (optional column) */
  binOperatorIds: Record<string, number>;
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    const v = value as {
      richText?: { text: string }[];
      result?: unknown;
      text?: unknown;
    };
    if (Array.isArray(v.richText)) {
      return v.richText.map((t) => t.text).join("").trim();
    }
    if (v.result !== undefined) return cellText(v.result);
    if (v.text !== undefined) return cellText(v.text);
    return "";
  }
  return String(value).trim();
}

const MAX_ERRORS_SHOWN = 3;
const HEADER_SCAN_ROWS = 10;

export async function parseCycleCountExcel(
  file: File,
): Promise<ParsedCycleCountFile> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.load(await file.arrayBuffer());
  } catch {
    throw new Error("Unable to read the Excel file. Please upload a valid .xlsx file.");
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("The Excel file has no sheet.");

  // Find the header row and the column of every field
  let headerRow = 0;
  const columns: Partial<Record<Column, number>> = {};
  for (let r = 1; r <= Math.min(HEADER_SCAN_ROWS, sheet.rowCount); r++) {
    const found: Partial<Record<Column, number>> = {};
    const priority: Partial<Record<Column, number>> = {};
    sheet.getRow(r).eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const key = normalize(cellText(cell.value));
      (Object.keys(HEADER_ALIASES) as Column[]).forEach((field) => {
        const rank = (HEADER_ALIASES[field] as readonly string[]).indexOf(key);
        if (rank >= 0 && (priority[field] === undefined || rank < priority[field]!)) {
          found[field] = colNumber;
          priority[field] = rank;
        }
      });
    });
    if (found.location && found.quantity && found.material) {
      headerRow = r;
      Object.assign(columns, found);
      break;
    }
  }

  if (!headerRow) {
    throw new Error("Required columns not found. The file must have Location, Qty and Material columns.");
  }

  const merged = new Map<string, AuditRow>();
  const binOperatorIds: Record<string, number> = {};
  const errors: string[] = [];

  for (let r = headerRow + 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const storage = cellText(row.getCell(columns.location!).value);
    const materialCode = cellText(row.getCell(columns.material!).value);
    const qtyText = cellText(row.getCell(columns.quantity!).value);
    const operatorText = columns.operator
      ? cellText(row.getCell(columns.operator).value)
      : "";

    // Skip empty rows
    if (!storage && !materialCode && !qtyText && !operatorText) continue;

    if (!storage) {
      errors.push(`Row ${r}: Location is missing`);
      continue;
    }
    if (!materialCode) {
      errors.push(`Row ${r}: Material is missing`);
      continue;
    }
    const quantity = Number(qtyText.replace(/,/g, ""));
    if (!qtyText || !Number.isFinite(quantity) || quantity <= 0) {
      errors.push(`Row ${r}: Qty must be a number greater than 0`);
      continue;
    }

    if (operatorText) {
      const operatorId = Number(operatorText);
      if (!Number.isInteger(operatorId) || operatorId <= 0) {
        errors.push(`Row ${r}: Operator ID must be a whole number`);
        continue;
      }
      if (
        binOperatorIds[storage] !== undefined &&
        binOperatorIds[storage] !== operatorId
      ) {
        errors.push(`Row ${r}: Location ${storage} has more than one Operator ID`);
        continue;
      }
      binOperatorIds[storage] = operatorId;
    }

    const key = `${storage}\u0000${materialCode}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += quantity;
    } else {
      merged.set(key, { storage, materialCode, quantity, excelRow: r });
    }
  }

  if (errors.length > 0) {
    const shown = errors.slice(0, MAX_ERRORS_SHOWN).join("; ");
    const more = errors.length - MAX_ERRORS_SHOWN;
    throw new Error(more > 0 ? `${shown}; and ${more} more error(s)` : shown);
  }

  if (merged.size === 0) throw new Error("The Excel file has no data rows.");

  return { rows: [...merged.values()], binOperatorIds };
}
