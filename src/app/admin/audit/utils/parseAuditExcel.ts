import type { AuditRow, AuditType } from "../types/audit";

const normalize = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const getValue = (value: unknown): string => {
  if (value && typeof value === "object") {
    if ("result" in value) {
      return getValue(value.result);
    }

    if ("text" in value) {
      return getValue(value.text);
    }

    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText
        .map((item: { text?: string }) => item.text ?? "")
        .join("");
    }
  }

  return String(value ?? "").trim();
};

export async function parseAuditExcel(
  file: File,
  auditType: AuditType,
): Promise<AuditRow[]> {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Upload an .xlsx Excel file.");
  }

  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();

  const buffer = new Uint8Array(await file.arrayBuffer());
  await workbook.xlsx.load(buffer as any);

  const sheet = workbook.worksheets[0];

  if (!sheet) {
    throw new Error("Excel worksheet not found.");
  }

  const columns = new Map<string, number>();

  sheet.getRow(1).eachCell((cell, column) => {
    columns.set(normalize(getValue(cell.value)), column);
  });

  const findColumn = (names: string[]) =>
    names
      .map((name) => columns.get(normalize(name)))
      .find((column) => column !== undefined);

  const storageColumn = findColumn([
    "StorageBin",
    "Storage",
    "Storage Location",
  ]);

  const materialColumn = findColumn([
    "Material",
    "Material Code",
    "Material Number",
  ]);

  const quantityColumn = findColumn(
    auditType === "cycle_count"
      ? ["Avail", "Stock", "Qty", "Quantity"]
      : ["Avail", "Stock", "Qty", "Quantity"],
  );

  if (
    storageColumn === undefined ||
    materialColumn === undefined ||
    quantityColumn === undefined
  ) {
    throw new Error(
      "Required Excel columns not found: StorageBin, Material, Avail/Stock.",
    );
  }

  const rows: AuditRow[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const storage = getValue(row.getCell(storageColumn).value);
    const materialCode = getValue(row.getCell(materialColumn).value);

    const quantityText = getValue(row.getCell(quantityColumn).value);

    if (!storage && !materialCode && !quantityText) return;

    const quantity = Number(quantityText.replace(/,/g, ""));

    if (
      !storage ||
      !materialCode ||
      !quantityText ||
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      throw new Error(`Invalid data at Excel row ${rowNumber}.`);
    }

    rows.push({
      storage,
      materialCode,
      quantity,
      excelRow: rowNumber,
    });
  });

  if (rows.length === 0) {
    throw new Error("No data rows found in the Excel file.");
  }

  return rows;
}
