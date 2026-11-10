import { API, fetchWithAuth } from "@/common/lib/endpoints";
import { FREE_STOCK_COLUMNS } from "./freeStockColumns";
import type { FreeStockFilters } from "../../types/freeStock";
import { freeStockApi } from "../../services/freeStock.service";
import { checked } from "./freeStockErrors";
import { stockCell } from "./freeStockFormat";
export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob), link = document.createElement("a");
  link.href = url; link.download = fileName; document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function downloadReservationTemplate() {
  const response = await checked(await fetchWithAuth(API.FREE_STOCK.RESERVATION_TEMPLATE));
  saveBlob(await response.blob(), "Free_Stock_Reservation_Template.xlsx");
}
export async function exportStock(filters: FreeStockFilters) {
  const ExcelJS = (await import("exceljs")).default;
  const book = new ExcelJS.Workbook(), sheet = book.addWorksheet("Free Stock");
  sheet.columns = [{ header: "Status", key: "status", width: 15 }, ...FREE_STOCK_COLUMNS.map((c) => ({ header: c.label, key: c.key, width: c.key === "materialCode" ? 30 : 22 }))];
  sheet.columns.forEach((column) => { column.numFmt = "@"; });
  const seen = new Set<number>(); let expected: number | null = null;
  for (let page = 1; ; page++) {
    const result = await freeStockApi.list({ ...filters, page, limit: 200 });
    if (expected !== null && result.pagination.total !== expected) throw new Error("Stock changed during export. Please export again.");
    expected = result.pagination.total;
    for (const row of result.data) {
      if (seen.has(row.id)) throw new Error("Stock changed during export. Please export again.");
      seen.add(row.id);
      sheet.addRow({ status: row.status, ...Object.fromEntries(FREE_STOCK_COLUMNS.map((c) => [c.key, stockCell(row, c)])) });
    }
    if (page >= result.pagination.totalPages) break;
  }
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFD200" } };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  saveBlob(new Blob([await book.xlsx.writeBuffer()], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "Free_Stock.xlsx");
}
