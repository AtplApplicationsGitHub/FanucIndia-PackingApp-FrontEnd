import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcel = async (data: any[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  if (data.length > 0) {
    // Generate headers from the keys of the first object
    const headers = Object.keys(data[0]);
    worksheet.columns = headers.map(header => ({
      header: header,
      key: header,
      width: Math.max(header.length + 5, 15) // Make columns reasonably wide
    }));

    // Add data rows
    worksheet.addRows(data);

    // Optional: Make header row bold
    worksheet.getRow(1).font = { bold: true };
  }

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
};