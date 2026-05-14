import ExcelJS from "exceljs";

// Style constants
const PRIMARY_COLOR = "FF0F172A";
const ACCENT_COLOR = "FF1E40AF";
const LIGHT_FILL = "FFE0E7FF";
const TOTAL_FILL = "FFF1F5F9";
const GRAND_FILL = "FF0F172A";

function setBorder(cell) {
  cell.border = {
    top: { style: "thin", color: { argb: "FFCBD5E1" } },
    left: { style: "thin", color: { argb: "FFCBD5E1" } },
    bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    right: { style: "thin", color: { argb: "FFCBD5E1" } },
  };
}

function styleHeaderRow(row, fillColor = ACCENT_COLOR, fontColor = "FFFFFFFF") {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: fontColor }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: fillColor },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    setBorder(cell);
  });
  row.height = 22;
}

function styleSectionTitle(cell, color = PRIMARY_COLOR) {
  cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 13 };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
  cell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
}

//  buildExcelBuffer(boq)
//  boq = output of buildBOQ()
export async function buildExcelBuffer(boq) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Quantrox";
  wb.created = new Date();
  wb.modified = new Date();
  wb.lastModifiedBy = "Quantrox";

  const ws = wb.addWorksheet("Bill of Quantities", {
    properties: { defaultRowHeight: 18 },
    pageSetup: {
      paperSize: 9,
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  });

  // We work in columns A..F (6 columns).
  ws.columns = [
    { width: 6 },
    { width: 30 },
    { width: 14 },
    { width: 12 },
    { width: 14 },
    { width: 16 },
  ];

  let row = 1;

  // Title bar
  ws.mergeCells(`A${row}:F${row}`);
  const titleCell = ws.getCell(`A${row}`);
  titleCell.value = "QUANTROX  ·  BILL OF QUANTITIES";
  titleCell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 18 };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: PRIMARY_COLOR },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  ws.getRow(row).height = 36;
  row++;

  ws.mergeCells(`A${row}:F${row}`);
  const subCell = ws.getCell(`A${row}`);
  subCell.value = `Project:  ${boq.projectName}`;
  subCell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
  subCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: ACCENT_COLOR },
  };
  subCell.alignment = { vertical: "middle", horizontal: "center" };
  ws.getRow(row).height = 24;
  row += 2; // blank row

  // Project Summary
  ws.mergeCells(`A${row}:F${row}`);
  const summaryHeader = ws.getCell(`A${row}`);
  summaryHeader.value = "1. PROJECT SUMMARY";
  styleSectionTitle(summaryHeader);
  ws.getRow(row).height = 22;
  row++;

  boq.summary.forEach((s) => {
    ws.mergeCells(`A${row}:B${row}`);
    ws.mergeCells(`C${row}:F${row}`);

    const labelCell = ws.getCell(`A${row}`);
    const valueCell = ws.getCell(`C${row}`);

    labelCell.value = s.label;
    valueCell.value = s.unit ? `${s.value} ${s.unit}` : s.value;
    labelCell.font = { bold: true, size: 10 };
    labelCell.alignment = { vertical: "middle", indent: 1 };
    valueCell.alignment = { vertical: "middle", indent: 1 };
    setBorder(labelCell);
    setBorder(valueCell);
    row++;
  });
  row++;

  // Room Schedule
  if (boq.rooms.length > 0) {
    ws.mergeCells(`A${row}:F${row}`);
    styleSectionTitle(ws.getCell(`A${row}`));
    ws.getCell(`A${row}`).value = "2. ROOM SCHEDULE";
    ws.getRow(row).height = 22;
    row++;

    // Header
    ws.getRow(row).values = [
      "#",
      "Room Name",
      "Type",
      "Area (m²)",
      "Perimeter (m)",
      "",
    ];
    ws.mergeCells(`E${row}:F${row}`);
    styleHeaderRow(ws.getRow(row));
    row++;

    boq.rooms.forEach((r) => {
      ws.getRow(row).values = [r.no, r.name, r.type, r.area, r.perimeter, ""];
      ws.mergeCells(`E${row}:F${row}`);

      const cells = ws.getRow(row);

      cells.eachCell((cell, i) => setBorder(cell));
      cells.getCell(1).alignment = { horizontal: "center" };
      cells.getCell(3).alignment = { horizontal: "center" };
      cells.getCell(4).numFmt = "#,##0.00";
      cells.getCell(5).numFmt = "#,##0.00";
      cells.getCell(4).alignment = { horizontal: "right" };
      cells.getCell(5).alignment = { horizontal: "right" };
      row++;
    });
    row++;
  }

  // Materials
  ws.mergeCells(`A${row}:F${row}`);
  styleSectionTitle(ws.getCell(`A${row}`));
  ws.getCell(`A${row}`).value = "3. MATERIAL ESTIMATE";
  ws.getRow(row).height = 22;
  row++;

  ws.getRow(row).values = [
    "#",
    "Item",
    "Quantity",
    "Unit",
    "Rate (LKR)",
    "Total (LKR)",
  ];
  styleHeaderRow(ws.getRow(row));
  row++;

  const matStartRow = row;
  boq.materials.items.forEach((m) => {
    ws.getRow(row).values = [m.no, m.item, m.quantity, m.unit, m.rate, m.total];
    const cells = ws.getRow(row);
    cells.eachCell((cell) => setBorder(cell));
    cells.getCell(1).alignment = { horizontal: "center" };
    cells.getCell(3).numFmt = "#,##0.000";
    cells.getCell(4).alignment = { horizontal: "center" };
    cells.getCell(5).numFmt = "#,##0";
    cells.getCell(6).numFmt = "#,##0";
    cells.getCell(3).alignment = { horizontal: "right" };
    cells.getCell(5).alignment = { horizontal: "right" };
    cells.getCell(6).alignment = { horizontal: "right" };
    row++;
  });

  // Material subtotal
  if (boq.materials.items.length > 0) {
    ws.mergeCells(`A${row}:E${row}`);
    const labelCell = ws.getCell(`A${row}`);
    labelCell.value = "Material Subtotal";
    labelCell.font = { bold: true };
    labelCell.alignment = { horizontal: "right", indent: 1 };
    labelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: TOTAL_FILL },
    };

    const totalCell = ws.getCell(`F${row}`);
    totalCell.value = { formula: `SUM(F${matStartRow}:F${row - 1})` };
    totalCell.numFmt = "#,##0";
    totalCell.font = { bold: true };
    totalCell.alignment = { horizontal: "right" };
    totalCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: TOTAL_FILL },
    };
    setBorder(labelCell);
    setBorder(totalCell);
    row++;
  }
  row++;

  // Labour
  ws.mergeCells(`A${row}:F${row}`);
  styleSectionTitle(ws.getCell(`A${row}`));
  ws.getCell(`A${row}`).value = "4. LABOUR ESTIMATE";
  ws.getRow(row).height = 22;
  row++;

  ws.getRow(row).values = [
    "#",
    "Task",
    "Days",
    "Workers",
    "Rate/Day (LKR)",
    "Total (LKR)",
  ];
  styleHeaderRow(ws.getRow(row));
  row++;

  const labStartRow = row;
  boq.labour.items.forEach((l) => {
    ws.getRow(row).values = [l.no, l.task, l.days, l.workers, l.rate, l.total];
    const cells = ws.getRow(row);
    cells.eachCell((cell) => setBorder(cell));
    cells.getCell(1).alignment = { horizontal: "center" };
    cells.getCell(3).alignment = { horizontal: "right" };
    cells.getCell(4).alignment = { horizontal: "center" };
    cells.getCell(5).numFmt = "#,##0";
    cells.getCell(6).numFmt = "#,##0";
    cells.getCell(5).alignment = { horizontal: "right" };
    cells.getCell(6).alignment = { horizontal: "right" };
    row++;
  });

  if (boq.labour.items.length > 0) {
    ws.mergeCells(`A${row}:E${row}`);
    const labelCell = ws.getCell(`A${row}`);
    labelCell.value = "Labour Subtotal";
    labelCell.font = { bold: true };
    labelCell.alignment = { horizontal: "right", indent: 1 };
    labelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: TOTAL_FILL },
    };

    const totalCell = ws.getCell(`F${row}`);
    totalCell.value = { formula: `SUM(F${labStartRow}:F${row - 1})` };
    totalCell.numFmt = "#,##0";
    totalCell.font = { bold: true };
    totalCell.alignment = { horizontal: "right" };
    totalCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: TOTAL_FILL },
    };
    setBorder(labelCell);
    setBorder(totalCell);
    row++;
  }
  row++;

  // Grand total
  ws.mergeCells(`A${row}:E${row}`);
  const grandLabel = ws.getCell(`A${row}`);
  grandLabel.value = "GRAND TOTAL (LKR)";
  grandLabel.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 14 };
  grandLabel.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: GRAND_FILL },
  };
  grandLabel.alignment = { horizontal: "right", vertical: "middle", indent: 1 };

  const grandTotal = ws.getCell(`F${row}`);
  grandTotal.value = boq.grandTotal;
  grandTotal.numFmt = "#,##0";
  grandTotal.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 14 };
  grandTotal.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: GRAND_FILL },
  };
  grandTotal.alignment = { horizontal: "right", vertical: "middle" };
  ws.getRow(row).height = 32;
  row += 2;

  // Notes
  ws.mergeCells(`A${row}:F${row}`);
  styleSectionTitle(ws.getCell(`A${row}`));
  ws.getCell(`A${row}`).value = "NOTES";
  ws.getRow(row).height = 22;
  row++;

  boq.notes.forEach((note) => {
    ws.mergeCells(`A${row}:F${row}`);
    const cell = ws.getCell(`A${row}`);
    cell.value = `• ${note}`;
    cell.font = { italic: true, size: 9, color: { argb: "FF475569" } };
    cell.alignment = { vertical: "middle", indent: 1, wrapText: true };
    ws.getRow(row).height = 18;
    row++;
  });

  const buffer = await wb.xlsx.writeBuffer();
  return buffer;
}
