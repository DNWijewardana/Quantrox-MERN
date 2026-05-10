import projectModel from "../models/projectModel.js";
import { buildBOQ, buildFilename } from "../utils/boqBuilder.js";
import { buildExcelBuffer } from "../utils/excelExporter.js";
import { buildPdfBuffer } from "../utils/pdfExporter.js";

async function loadProjectWithEstimate(userId, projectId) {
  const project = await projectModel.findOne({ _id: projectId, userId });
  if (!project) {
    return { error: { code: 404, message: "Project not found" } };
  }
  if (!project.estimate?.calculatedAt) {
    return {
      error: {
        code: 400,
        message: "No estimate yet. Please run Calculate first.",
      },
    };
  }
  return { project };
}

// Export estimate as Excel
export const exportExcel = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const { project, error } = await loadProjectWithEstimate(userId, id);
    if (error) {
      return res
        .status(error.code)
        .json({ success: false, message: error.message });
    }

    // Build the BOQ structure → workbook buffer
    const boq = buildBOQ(project.toObject(), project.estimate);
    const buffer = await buildExcelBuffer(boq);

    const filename = buildFilename(project.name, "xlsx");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);
    // Tell axios this header is exposed (so frontend can read it for the filename)
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    return res.end(buffer);
  } catch (err) {
    console.error("Excel export failed:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Export the BOQ as a PDF file
export const exportPdf = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const { project, error } = await loadProjectWithEstimate(userId, id);
    if (error) {
      return res
        .status(error.code)
        .json({ success: false, message: error.message });
    }

    const boq = buildBOQ(project.toObject(), project.estimate);
    const buffer = await buildPdfBuffer(boq);

    const filename = buildFilename(project.name, "pdf");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    return res.end(buffer);
  } catch (err) {
    console.error("PDF export failed:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
