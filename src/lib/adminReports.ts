import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

export type ReportColumn = { header: string; key: string; width?: number };

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPdf(opts: {
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  rows: Record<string, any>[];
  filename: string;
  summary?: { label: string; value: string }[];
}) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text("Peaks Hotel Nanyuki", 14, 14);
  doc.setFontSize(12);
  doc.text(opts.title, 14, 22);
  if (opts.subtitle) {
    doc.setFontSize(9);
    doc.text(opts.subtitle, 14, 28);
  }
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

  autoTable(doc, {
    startY: 40,
    head: [opts.columns.map((c) => c.header)],
    body: opts.rows.map((r) => opts.columns.map((c) => formatCell(r[c.key]))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [100, 80, 50] },
  });

  if (opts.summary?.length) {
    const finalY = (doc as any).lastAutoTable?.finalY ?? 40;
    doc.setFontSize(10);
    let y = finalY + 8;
    opts.summary.forEach((s) => {
      doc.text(`${s.label}: ${s.value}`, 14, y);
      y += 5;
    });
  }

  doc.save(opts.filename.endsWith(".pdf") ? opts.filename : `${opts.filename}.pdf`);
}

export async function exportExcel(opts: {
  sheetName: string;
  title: string;
  columns: ReportColumn[];
  rows: Record<string, any>[];
  filename: string;
  summary?: { label: string; value: string }[];
}) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Peaks Hotel Nanyuki";
  wb.created = new Date();
  const ws = wb.addWorksheet(opts.sheetName.slice(0, 30));

  ws.mergeCells(1, 1, 1, opts.columns.length);
  ws.getCell(1, 1).value = opts.title;
  ws.getCell(1, 1).font = { bold: true, size: 14 };

  ws.getRow(3).values = opts.columns.map((c) => c.header);
  ws.getRow(3).font = { bold: true };
  ws.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEFE6D6" },
  };

  opts.columns.forEach((c, i) => {
    ws.getColumn(i + 1).width = c.width ?? 18;
  });

  opts.rows.forEach((r, idx) => {
    ws.getRow(4 + idx).values = opts.columns.map((c) => normalizeCell(r[c.key]));
  });

  if (opts.summary?.length) {
    const startRow = 4 + opts.rows.length + 2;
    opts.summary.forEach((s, i) => {
      ws.getCell(startRow + i, 1).value = s.label;
      ws.getCell(startRow + i, 1).font = { bold: true };
      ws.getCell(startRow + i, 2).value = s.value;
    });
  }

  const buf = await wb.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    opts.filename.endsWith(".xlsx") ? opts.filename : `${opts.filename}.xlsx`,
  );
}

function formatCell(v: any): string {
  if (v == null) return "";
  if (v instanceof Date) return v.toLocaleDateString();
  return String(v);
}
function normalizeCell(v: any) {
  if (v == null) return "";
  return v;
}
