import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');

export function exportRows(rows, columns, fileName, type = 'xlsx') {
  const heading = columns.map((column) => column.header);
  const body = rows.map((row) => columns.map((column) => row[column.key] ?? ''));
  const generatedAt = new Date().toLocaleString('en-IN');

  if (type === 'pdf') {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text(`${fileName} - ${generatedAt}`, 14, 12);
    autoTable(doc, { head: [heading], body, startY: 18, styles: { fontSize: 8 } });
    doc.save(`${fileName}-${stamp()}.pdf`);
    return;
  }

  const sheetRows = [
    [`Generated at: ${generatedAt}`],
    [],
    heading,
    ...body,
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  XLSX.writeFile(workbook, `${fileName}-${stamp()}.xlsx`);
}
