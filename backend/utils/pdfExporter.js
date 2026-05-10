import PDFDocument from "pdfkit";

// Colors used in the PDF
const COLORS = {
  primary: "#0F172A",
  accent: "#1E40AF",
  light: "#E0E7FF",
  grey: "#64748B",
  border: "#CBD5E1",
  rowAlt: "#F8FAFC",
  headFill: "#1E40AF",
  totalBg: "#F1F5F9",
};

// Page geometry
const PAGE_MARGIN = 40;
const PAGE_W = 595;
const PAGE_H = 842;
const CONTENT_W = PAGE_W - PAGE_MARGIN * 2;

//  buildPdfBuffer(boq)
export function buildPdfBuffer(boq) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: PAGE_MARGIN,
        bufferPages: true,
        info: {
          Title: `${boq.projectName} — Bill of Quantities`,
          Author: "Quantrox",
          Subject: "Construction Cost Estimate",
          Creator: "Quantrox BOQ Exporter",
        },
      });

      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Render!
      renderTitleBlock(doc, boq);
      renderSummary(doc, boq);
      renderRooms(doc, boq);
      renderMaterials(doc, boq);
      renderLabour(doc, boq);
      renderGrandTotal(doc, boq);
      renderNotes(doc, boq);
      renderFooter(doc);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Move down, but if we'd run off the page, start a new one
function ensureSpace(doc, neededHeight) {
  if (doc.y + neededHeight > PAGE_H - PAGE_MARGIN - 40) {
    doc.addPage();
  }
}

function fmt(n, decimals = 0) {
  if (n === null || n === undefined || isNaN(n)) return "0";
  return Number(n).toLocaleString("en-LK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

// Draw a row of cells inside a table.
//   cols: [{ width, text, align }]
function drawTableRow(doc, cols, y, options = {}) {
  const {
    rowHeight = 20,
    fillColor = null,
    textColor = "#0F172A",
    bold = false,
    fontSize = 9,
  } = options;

  let x = PAGE_MARGIN;

  // Optional fill
  if (fillColor) {
    doc.rect(PAGE_MARGIN, y, CONTENT_W, rowHeight).fill(fillColor);
  }

  // Text
  doc
    .fillColor(textColor)
    .font(bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(fontSize);

  cols.forEach((c) => {
    const align = c.align || "left";
    const text = c.text === undefined || c.text === null ? "" : String(c.text);
    doc.text(text, x + 4, y + 6, {
      width: c.width - 8,
      align,
      ellipsis: true,
      lineBreak: false,
    });
    x += c.width;
  });

  // Borders
  doc.strokeColor(COLORS.border).lineWidth(0.5);
  doc.rect(PAGE_MARGIN, y, CONTENT_W, rowHeight).stroke();
  let bx = PAGE_MARGIN;
  cols.forEach((c) => {
    bx += c.width;
    if (bx < PAGE_MARGIN + CONTENT_W) {
      doc
        .moveTo(bx, y)
        .lineTo(bx, y + rowHeight)
        .stroke();
    }
  });

  return y + rowHeight;
}

//  Section renderers
function renderTitleBlock(doc, boq) {
  // Dark navy bar
  doc.rect(0, 0, PAGE_W, 70).fill(COLORS.primary);

  // Quantrox brand
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("QUANTROX", PAGE_MARGIN, 20);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#CBD5E1")
    .text("AI-Powered Construction Cost Estimation", PAGE_MARGIN, 46);

  // Right side — title
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("BILL OF QUANTITIES", PAGE_MARGIN, 28, {
      width: CONTENT_W,
      align: "right",
    });

  // Blue strip with project name
  doc.rect(0, 70, PAGE_W, 30).fill(COLORS.accent);
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(`Project: ${boq.projectName}`, PAGE_MARGIN, 78, {
      width: CONTENT_W,
      align: "left",
    });
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(boq.calcDate.toLocaleDateString(), PAGE_MARGIN, 80, {
      width: CONTENT_W,
      align: "right",
    });

  doc.y = 120;
  doc.fillColor(COLORS.primary);
}

function renderSectionTitle(doc, n, title) {
  ensureSpace(doc, 30);
  const y = doc.y;
  doc.rect(PAGE_MARGIN, y, CONTENT_W, 22).fill(COLORS.primary);
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(`${n}.  ${title}`, PAGE_MARGIN + 8, y + 6);
  doc.y = y + 28;
  doc.fillColor(COLORS.primary);
}

function renderSummary(doc, boq) {
  renderSectionTitle(doc, 1, "PROJECT SUMMARY");

  let y = doc.y;
  boq.summary.forEach((s) => {
    ensureSpace(doc, 22);
    if (doc.y !== y) y = doc.y;

    const value = s.unit ? `${s.value} ${s.unit}` : s.value;
    const labelW = CONTENT_W * 0.45;
    const valueW = CONTENT_W * 0.55;
    const rowH = 22;

    // Border + grid lines
    doc.strokeColor(COLORS.border).lineWidth(0.5);
    doc.rect(PAGE_MARGIN, y, CONTENT_W, rowH).stroke();
    doc
      .moveTo(PAGE_MARGIN + labelW, y)
      .lineTo(PAGE_MARGIN + labelW, y + rowH)
      .stroke();

    // Bold label
    doc
      .fillColor(COLORS.primary)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(s.label, PAGE_MARGIN + 4, y + 6, {
        width: labelW - 8,
        lineBreak: false,
      });

    // Regular value
    doc
      .font("Helvetica")
      .fontSize(9)
      .text(String(value), PAGE_MARGIN + labelW + 4, y + 6, {
        width: valueW - 8,
        lineBreak: false,
      });

    y += rowH;
  });
  doc.y = y + 12;
}

function renderRooms(doc, boq) {
  if (!boq.rooms.length) return;
  renderSectionTitle(doc, 2, "ROOM SCHEDULE");

  let y = doc.y;
  // Header
  const cols = [
    { width: CONTENT_W * 0.06, text: "#", align: "center" },
    { width: CONTENT_W * 0.36, text: "Room Name", align: "left" },
    { width: CONTENT_W * 0.2, text: "Type", align: "center" },
    { width: CONTENT_W * 0.19, text: "Area (m²)", align: "right" },
    { width: CONTENT_W * 0.19, text: "Perim. (m)", align: "right" },
  ];
  y = drawTableRow(doc, cols, y, {
    rowHeight: 22,
    fillColor: COLORS.headFill,
    textColor: "#FFFFFF",
    bold: true,
    fontSize: 10,
  });

  boq.rooms.forEach((r, i) => {
    ensureSpace(doc, 20);
    if (doc.y !== y) y = doc.y;
    y = drawTableRow(
      doc,
      [
        { width: cols[0].width, text: r.no, align: "center" },
        { width: cols[1].width, text: r.name, align: "left" },
        { width: cols[2].width, text: r.type, align: "center" },
        { width: cols[3].width, text: fmt(r.area, 2), align: "right" },
        { width: cols[4].width, text: fmt(r.perimeter, 2), align: "right" },
      ],
      y,
      { rowHeight: 20, fillColor: i % 2 ? COLORS.rowAlt : null },
    );
  });
  doc.y = y + 12;
}

function renderMaterials(doc, boq) {
  renderSectionTitle(doc, 3, "MATERIAL ESTIMATE");

  let y = doc.y;
  const cols = [
    { width: CONTENT_W * 0.05, text: "#", align: "center" },
    { width: CONTENT_W * 0.36, text: "Item", align: "left" },
    { width: CONTENT_W * 0.13, text: "Qty", align: "right" },
    { width: CONTENT_W * 0.1, text: "Unit", align: "center" },
    { width: CONTENT_W * 0.16, text: "Rate (LKR)", align: "right" },
    { width: CONTENT_W * 0.2, text: "Total (LKR)", align: "right" },
  ];
  y = drawTableRow(doc, cols, y, {
    rowHeight: 22,
    fillColor: COLORS.headFill,
    textColor: "#FFFFFF",
    bold: true,
    fontSize: 10,
  });

  boq.materials.items.forEach((m, i) => {
    ensureSpace(doc, 20);
    if (doc.y !== y) y = doc.y;
    y = drawTableRow(
      doc,
      [
        { width: cols[0].width, text: m.no, align: "center" },
        { width: cols[1].width, text: m.item, align: "left" },
        { width: cols[2].width, text: fmt(m.quantity, 3), align: "right" },
        { width: cols[3].width, text: m.unit, align: "center" },
        { width: cols[4].width, text: fmt(m.rate), align: "right" },
        { width: cols[5].width, text: fmt(m.total), align: "right" },
      ],
      y,
      { rowHeight: 20, fillColor: i % 2 ? COLORS.rowAlt : null },
    );
  });

  // Subtotal row
  ensureSpace(doc, 22);
  if (doc.y !== y) y = doc.y;
  y = drawTableRow(
    doc,
    [
      {
        width:
          cols[0].width +
          cols[1].width +
          cols[2].width +
          cols[3].width +
          cols[4].width,
        text: "Material Subtotal",
        align: "right",
      },
      {
        width: cols[5].width,
        text: fmt(boq.materials.subtotal),
        align: "right",
      },
    ],
    y,
    { rowHeight: 22, fillColor: COLORS.totalBg, bold: true, fontSize: 10 },
  );
  doc.y = y + 12;
}

function renderLabour(doc, boq) {
  renderSectionTitle(doc, 4, "LABOUR ESTIMATE");

  let y = doc.y;
  const cols = [
    { width: CONTENT_W * 0.05, text: "#", align: "center" },
    { width: CONTENT_W * 0.4, text: "Task", align: "left" },
    { width: CONTENT_W * 0.1, text: "Days", align: "right" },
    { width: CONTENT_W * 0.1, text: "Workers", align: "center" },
    { width: CONTENT_W * 0.15, text: "Rate (LKR)", align: "right" },
    { width: CONTENT_W * 0.2, text: "Total (LKR)", align: "right" },
  ];
  y = drawTableRow(doc, cols, y, {
    rowHeight: 22,
    fillColor: COLORS.headFill,
    textColor: "#FFFFFF",
    bold: true,
    fontSize: 10,
  });

  boq.labour.items.forEach((l, i) => {
    ensureSpace(doc, 20);
    if (doc.y !== y) y = doc.y;
    y = drawTableRow(
      doc,
      [
        { width: cols[0].width, text: l.no, align: "center" },
        { width: cols[1].width, text: l.task, align: "left" },
        { width: cols[2].width, text: l.days, align: "right" },
        { width: cols[3].width, text: l.workers, align: "center" },
        { width: cols[4].width, text: fmt(l.rate), align: "right" },
        { width: cols[5].width, text: fmt(l.total), align: "right" },
      ],
      y,
      { rowHeight: 20, fillColor: i % 2 ? COLORS.rowAlt : null },
    );
  });

  // Subtotal
  ensureSpace(doc, 22);
  if (doc.y !== y) y = doc.y;
  y = drawTableRow(
    doc,
    [
      {
        width:
          cols[0].width +
          cols[1].width +
          cols[2].width +
          cols[3].width +
          cols[4].width,
        text: "Labour Subtotal",
        align: "right",
      },
      { width: cols[5].width, text: fmt(boq.labour.subtotal), align: "right" },
    ],
    y,
    { rowHeight: 22, fillColor: COLORS.totalBg, bold: true, fontSize: 10 },
  );
  doc.y = y + 12;
}

function renderGrandTotal(doc, boq) {
  ensureSpace(doc, 40);
  const y = doc.y;
  doc.rect(PAGE_MARGIN, y, CONTENT_W, 32).fill(COLORS.primary);

  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("GRAND TOTAL (LKR)", PAGE_MARGIN + 16, y + 9, {
      width: CONTENT_W * 0.5,
    });

  doc.text(fmt(boq.grandTotal), PAGE_MARGIN, y + 9, {
    width: CONTENT_W - 16,
    align: "right",
  });

  doc.y = y + 40;
  doc.fillColor(COLORS.primary);
}

function renderNotes(doc, boq) {
  renderSectionTitle(doc, 5, "NOTES");

  doc.font("Helvetica").fontSize(9).fillColor(COLORS.grey);
  boq.notes.forEach((n) => {
    ensureSpace(doc, 18);
    doc.text(`•  ${n}`, PAGE_MARGIN + 4, doc.y, {
      width: CONTENT_W - 8,
      lineGap: 2,
    });
    doc.moveDown(0.3);
  });
}

function renderFooter(doc) {
  const range = doc.bufferedPageRange();
  const total = range.count;

  for (let i = range.start; i < range.start + total; i++) {
    doc.switchToPage(i);

    // Footer bar
    doc
      .fillColor(COLORS.grey)
      .font("Helvetica")
      .fontSize(8)
      .text(
        `Quantrox · BOQ generated ${new Date().toLocaleDateString()} · Page ${i - range.start + 1} of ${total}`,
        PAGE_MARGIN,
        PAGE_H - 30,
        { width: CONTENT_W, align: "center" },
      );
  }
}
