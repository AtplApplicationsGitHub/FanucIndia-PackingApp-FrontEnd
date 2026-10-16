import type { AuditRow } from "../types/audit";

// Same rules as BE (bom-audit.constants.ts / bom-audit-file.parser.ts)
const MAX_DATA_ROWS = 20000;
const MAX_REPORTED_ERRORS = 200;
const MAX_LENGTH = 100;

const HEADER_ALIASES = {
  materialCode: [
    "materialcode",
    "material",
    "materialno",
    "materialnumber",
    "partno",
    "partnumber",
  ],
  storage: ["storage", "storagebin", "bin", "binno", "binnumber"],
  qty: ["qty", "quantity", "avail", "expectedqty", "availableqty"],
} as const;

const normalize = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const getValue = (value: unknown): string => {
  if (value && typeof value === "object") {
    if ("result" in value) return getValue(value.result);
    if ("text" in value) return getValue(value.text);
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText
        .map((item: { text?: string }) => item.text ?? "")
        .join("");
    }
  }
  return String(value ?? "").trim();
};

const naturalCompare = (a: string, b: string) =>
  a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });

export async function parseAuditExcel(file: File): Promise<AuditRow[]> {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Upload an .xlsx Excel file.");
  }

  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(new Uint8Array(await file.arrayBuffer()) as any);

  const sheet = workbook.worksheets.find((ws) => ws.actualRowCount > 0);
  if (!sheet) throw new Error("The uploaded file is empty.");

  // Header = first non-empty row (same as BE)
  let headerRowNo = 0;
  sheet.eachRow({ includeEmpty: false }, (row) => {
    if (!headerRowNo) headerRowNo = row.number;
  });

  const headers = new Map<string, number>();
  sheet.getRow(headerRowNo).eachCell({ includeEmpty: false }, (cell, col) => {
    const key = normalize(getValue(cell.value));
    if (key && !headers.has(key)) headers.set(key, col);
  });

  const findColumn = (aliases: readonly string[]) =>
    aliases.map((alias) => headers.get(alias)).find((col) => col !== undefined);

  const materialColumn = findColumn(HEADER_ALIASES.materialCode);
  const storageColumn = findColumn(HEADER_ALIASES.storage);
  const qtyColumn = findColumn(HEADER_ALIASES.qty);

  const missing = [
    materialColumn === undefined && "Material Code",
    storageColumn === undefined && "Storage",
    qtyColumn === undefined && "Qty",
  ].filter(Boolean);

  if (
    missing.length ||
    materialColumn === undefined ||
    storageColumn === undefined ||
    qtyColumn === undefined
  ) {
    throw new Error(
      `Required column(s) missing: ${missing.join(", ")}. ` +
        "The file must have the columns Material Code, Storage and Qty in the first row.",
    );
  }

  const grouped = new Map<string, Map<string, AuditRow>>();
  const rowErrors: string[] = [];
  let totalRows = 0;
  let totalRowErrors = 0;

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber <= headerRowNo) return;

    const materialCode = getValue(
      row.getCell(materialColumn).value,
    ).toUpperCase();
    const storage = getValue(row.getCell(storageColumn).value).toUpperCase();
    const qtyText = getValue(row.getCell(qtyColumn).value);

    if (!materialCode && !storage && !qtyText) return;

    totalRows += 1;
    if (totalRows > MAX_DATA_ROWS) return;

    const errors: string[] = [];

    if (!materialCode) errors.push("Material Code is missing");
    else if (materialCode.length > MAX_LENGTH)
      errors.push(`Material Code is longer than ${MAX_LENGTH} characters`);

    if (!storage) errors.push("Storage is missing");
    else if (storage.length > MAX_LENGTH)
      errors.push(`Storage is longer than ${MAX_LENGTH} characters`);

    const qtyClean = qtyText.replace(/,/g, "");
    const qty = /^\d+(\.0+)?$/.test(qtyClean) ? Number(qtyClean) : null;
    if (!qtyText) errors.push("Qty is missing");
    else if (qty === null || !Number.isSafeInteger(qty) || qty <= 0)
      errors.push(`Qty "${qtyText}" must be a whole number greater than 0`);

    if (errors.length) {
      totalRowErrors += 1;
      if (rowErrors.length < MAX_REPORTED_ERRORS) {
        rowErrors.push(`Row ${rowNumber}: ${errors.join(", ")}`);
      }
      return;
    }

    let materials = grouped.get(storage);
    if (!materials) {
      materials = new Map();
      grouped.set(storage, materials);
    }
    const existing = materials.get(materialCode);
    materials.set(
      materialCode,
      existing
        ? { ...existing, quantity: existing.quantity + (qty as number) }
        : {
            storage,
            materialCode,
            quantity: qty as number,
            excelRow: rowNumber,
          },
    );
  });

  if (totalRows > MAX_DATA_ROWS) {
    throw new Error(
      `The file has ${totalRows} data rows. Maximum allowed is ${MAX_DATA_ROWS} rows per audit.`,
    );
  }

  if (totalRowErrors > 0) {
    const shown =
      totalRowErrors > rowErrors.length
        ? ` (showing the first ${rowErrors.length})`
        : "";
    throw new Error(
      [
        `${totalRowErrors} row(s) have invalid data${shown}. Please correct the file and upload again.`,
        ...rowErrors,
      ].join("\n"),
    );
  }

  if (totalRows === 0) {
    throw new Error("The file has no data rows below the header.");
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => naturalCompare(a, b))
    .flatMap(([, materials]) =>
      [...materials.values()].sort((a, b) =>
        naturalCompare(a.materialCode, b.materialCode),
      ),
    );
}
