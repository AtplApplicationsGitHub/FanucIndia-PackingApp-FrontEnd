import type { AuditRow } from "../types/audit";

// Same rules as BE (bom-audit.constants.ts / bom-audit-file.parser.ts)
const MAX_DATA_ROWS = 20000;
const MAX_REPORTED_ERRORS = 200;
const MAX_LENGTH = 100;
// Template: the header row is searched in the first rows ("Audit Name" sits above the table)
const HEADER_SEARCH_ROWS = 20;
const AUDIT_NAME_LABEL = "auditname";
const MAX_AUDIT_NAME = 255;

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

const OPTIONAL_ALIASES = {
  operator: [
    "operator",
    "operatorid",
    "operatorname",
    "assignedto",
    "user",
    "auditor",
  ],
  auditName: ["auditname"],
} as const;

/** USER-role operator from GET /bom-audit/operators */
export type AuditOperator = { id: number; name: string; email: string };

/** Same label as the template dropdown and the server: "Name (email)" */
const operatorLabel = (o: AuditOperator) => `${o.name} (${o.email})`;

/** Operator must be a valid numeric USER-role operator ID. */
const matchOperator = (
  label: string,
  operators: AuditOperator[],
): { operator?: AuditOperator; problem?: string } => {
  if (!/^\d+$/.test(label)) {
    return {
      problem: `Operator "${label}" must be the Operator ID (a whole number, e.g. 12)`,
    };
  }

  const operator = operators.find((o) => o.id === Number(label));

  return operator
    ? { operator }
    : {
        problem: `Operator ID ${label} does not exist or is not an operator (USER role)`,
      };
};

/** Result of reading the template on the browser (preview only - the server checks everything again). */
export type ParsedAuditFile = {
  auditName: string;
  rows: AuditRow[];
  /** One entry per operator (= one audit), in file order */
  operators: {
    label: string;
    /** number of storage bins (locations) of this operator */
    bins: number;
    /** the storage bins (locations) themselves, naturally sorted */
    locations: string[];
    records: number;
  }[];
};

export type ParseAuditExcelOptions = {
  /**
   * true (default): the Audit Name must be in the file (row 1 / Audit Name column).
   * false: the name is typed in the page textbox, so a missing name in the file is NOT an error.
   */
  requireAuditNameInFile?: boolean;
};

const INVISIBLE = /[​-‍⁠﻿]/g;

const normalize = (value: unknown) =>
  String(value ?? "")
    .replace(INVISIBLE, "")
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
  return String(value ?? "")
    .replace(INVISIBLE, "")
    .replace(/ /g, " ")
    .trim();
};

const naturalCompare = (a: string, b: string) =>
  a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });

/**
 * @param operatorList USER-role operators (GET /bom-audit/operators). When given, every Operator in the
 *        file is checked against it BEFORE the preview, so a typed / pasted name that is not in the
 *        dropdown is reported here instead of only after "Confirm & Assign".
 */
export async function parseAuditExcel(
  file: File,
  operatorList?: AuditOperator[],
  options: ParseAuditExcelOptions = {},
): Promise<ParsedAuditFile> {
  const { requireAuditNameInFile = true } = options;
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Upload an .xlsx Excel file.");
  }

  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(new Uint8Array(await file.arrayBuffer()) as any);

  const sheet = workbook.worksheets.find(
    (ws) =>
      ws.actualRowCount > 0 &&
      ws.state !== "hidden" &&
      ws.state !== "veryHidden",
  );
  if (!sheet) throw new Error("The uploaded file is empty.");

  // Header = first row (within the first rows) that has Material Code, Storage and Qty (same as BE)
  const requiredCount = Object.keys(HEADER_ALIASES).length;
  let best: {
    rowNo: number;
    headers: Map<string, number>;
    found: number;
  } | null = null;
  sheet.eachRow({ includeEmpty: false }, (row) => {
    if (row.number > HEADER_SEARCH_ROWS) return;
    if (best && best.found === requiredCount) return;
    const headers = new Map<string, number>();
    row.eachCell({ includeEmpty: false }, (cell, col) => {
      const key = normalize(getValue(cell.value));
      if (key && !headers.has(key)) headers.set(key, col);
    });
    const found = (
      Object.values(HEADER_ALIASES) as readonly (readonly string[])[]
    ).filter((aliases) => aliases.some((alias) => headers.has(alias))).length;
    if (!best || found > best.found)
      best = { rowNo: row.number, headers, found };
  });
  if (!best) throw new Error("The uploaded file is empty.");
  const { rowNo: headerRowNo, headers } = best as {
    rowNo: number;
    headers: Map<string, number>;
  };

  const findColumn = (aliases: readonly string[]) =>
    aliases.map((alias) => headers.get(alias)).find((col) => col !== undefined);

  const materialColumn = findColumn(HEADER_ALIASES.materialCode);
  const storageColumn = findColumn(HEADER_ALIASES.storage);
  const qtyColumn = findColumn(HEADER_ALIASES.qty);
  const operatorColumn = findColumn(OPTIONAL_ALIASES.operator);
  const auditNameColumn = findColumn(OPTIONAL_ALIASES.auditName);

  const missing = [
    materialColumn === undefined && "Material Code",
    storageColumn === undefined && "Storage",
    qtyColumn === undefined && "Qty",
    operatorColumn === undefined && "Operator",
  ].filter(Boolean);

  if (
    missing.length ||
    materialColumn === undefined ||
    storageColumn === undefined ||
    qtyColumn === undefined ||
    operatorColumn === undefined
  ) {
    throw new Error(
      `Required column(s) missing: ${missing.join(", ")}. ` +
        "The file must have the columns StorageBin, Material, Qty (or Avail) and Operator (Operator ID).",
    );
  }

  // "Audit Name" above the table: label cell, value = the cell to its right (template A1 / B1)
  let auditName = "";
  let hasAuditNameLabel = false;
  for (let r = 1; r < headerRowNo && !hasAuditNameLabel; r++) {
    sheet.getRow(r).eachCell({ includeEmpty: false }, (cell, col) => {
      if (
        hasAuditNameLabel ||
        normalize(getValue(cell.value)) !== AUDIT_NAME_LABEL
      )
        return;
      hasAuditNameLabel = true;
      auditName = getValue(sheet.getRow(r).getCell(col + 1).value).replace(
        /\s+/g,
        " ",
      );
    });
  }
  const auditNamesInColumn = new Set<string>();

  const grouped = new Map<string, Map<string, AuditRow>>();
  const binOperator = new Map<string, { label: string; rowNo: number }>();
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
    const operator = getValue(row.getCell(operatorColumn).value)
      .trim()
      .replace(/\s+/g, " ")
      .replace(/^(\d+)\.0+$/, "$1");

    if (!materialCode && !storage && !qtyText) return;

    if (auditNameColumn !== undefined) {
      const name = getValue(row.getCell(auditNameColumn).value).replace(
        /\s+/g,
        " ",
      );
      if (name) auditNamesInColumn.add(name);
    }

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

    // One storage bin = one operator
    if (!operator) errors.push("Operator is missing (enter the Operator ID)");
    else if (storage) {
      const assigned = binOperator.get(storage);
      if (!assigned)
        binOperator.set(storage, { label: operator, rowNo: rowNumber });
      else if (assigned.label.toLowerCase() !== operator.toLowerCase())
        errors.push(
          `Storage bin ${storage} is already assigned to "${assigned.label}" (row ${assigned.rowNo}). One storage bin can have only one operator`,
        );
    }

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
            operator,
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

  if (auditNamesInColumn.size > 1) {
    throw new Error(
      `The Audit Name column has ${auditNamesInColumn.size} different values. One file can have only one Audit Name.`,
    );
  }
  if (!auditName && auditNamesInColumn.size === 1)
    auditName = [...auditNamesInColumn][0];
  if (!auditName && requireAuditNameInFile) {
    throw new Error(
      'Audit Name is missing. Type it in the yellow "Audit Name" box at the top of the template (row 1).',
    );
  }
  if (auditName.length > MAX_AUDIT_NAME) {
    throw new Error(`Audit Name must be at most ${MAX_AUDIT_NAME} characters.`);
  }

  let rows = [...grouped.entries()]
    .sort(([a], [b]) => naturalCompare(a, b))
    .flatMap(([, materials]) =>
      [...materials.values()].sort((a, b) =>
        naturalCompare(a.materialCode, b.materialCode),
      ),
    );

  // Operators must exist (USER role) - checked against the live operator list, like the server does
  if (operatorList) {
    const resolved = new Map<string, AuditOperator>();
    const operatorErrors: { rowNo: number; text: string }[] = [];
    const invalid = new Set<string>();
    for (const [storage, { label, rowNo }] of binOperator) {
      if (!grouped.has(storage)) continue;
      const key = label.toLowerCase();
      if (resolved.has(key) || invalid.has(key)) continue;
      const { operator, problem } = matchOperator(label, operatorList);
      if (operator) resolved.set(key, operator);
      else {
        invalid.add(key);
        operatorErrors.push({ rowNo, text: `Row ${rowNo}: ${problem}` });
      }
    }
    if (operatorErrors.length) {
      operatorErrors.sort((a, b) => a.rowNo - b.rowNo);
      throw new Error(
        [
          `${operatorErrors.length} operator(s) in the file are not valid. Use the Operator ID of a Terminal Operator.`,
          ...operatorErrors.slice(0, MAX_REPORTED_ERRORS).map((e) => e.text),
        ].join("\n"),
      );
    }
    // Show the operator as "Name (email)" - two spellings of the same user become one audit (same as the server)
    rows = rows.map((row) => {
      const operator = resolved.get((row.operator ?? "").toLowerCase());
      return operator ? { ...row, operator: operatorLabel(operator) } : row;
    });
  }

  // One audit per operator, in the order the operators first appear in the file
  const operators = new Map<
    string,
    { label: string; bins: Set<string>; records: number; firstRow: number }
  >();
  for (const row of rows) {
    const key = (row.operator ?? "").toLowerCase();
    const entry = operators.get(key) ?? {
      label: row.operator ?? "",
      bins: new Set<string>(),
      records: 0,
      firstRow: binOperator.get(row.storage)?.rowNo ?? row.excelRow,
    };
    entry.firstRow = Math.min(
      entry.firstRow,
      binOperator.get(row.storage)?.rowNo ?? row.excelRow,
    );
    entry.bins.add(row.storage);
    entry.records += 1;
    operators.set(key, entry);
  }

  const orderedOperators = [...operators.values()].sort(
    (a, b) => a.firstRow - b.firstRow,
  );
  const operatorRank = new Map(
    orderedOperators.map((o, index) => [o.label.toLowerCase(), index]),
  );

  return {
    auditName,
    // Preview grouped like the audits that will be created: by operator, then storage bin
    rows: [...rows].sort(
      (a, b) =>
        (operatorRank.get((a.operator ?? "").toLowerCase()) ?? 0) -
          (operatorRank.get((b.operator ?? "").toLowerCase()) ?? 0) ||
        naturalCompare(a.storage, b.storage) ||
        naturalCompare(a.materialCode, b.materialCode),
    ),
    operators: orderedOperators.map((o) => ({
      label: o.label,
      bins: o.bins.size,
      locations: [...o.bins].sort(naturalCompare),
      records: o.records,
    })),
  };
}
