import projectModel from "../models/projectModel.js";
import settingsModel from "../models/settingsModel.js";
import { calculateEstimate } from "../utils/qtoEngine.js";

export const calculateProjectEstimate = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Load project
    const project = await projectModel.findOne({ _id: id, userId });
    if (!project) {
      return res.json({ success: false, message: "Project not found" });
    }

    // Must have at least 1 room or 1 wall to compute anything sensible
    if (
      (!project.rooms || project.rooms.length === 0) &&
      (!project.walls || project.walls.length === 0)
    ) {
      return res.json({
        success: false,
        message:
          "Draw at least one room or wall in the editor before calculating.",
      });
    }

    // Load settings (or auto-create defaults)
    let settings = await settingsModel.findOne({ userId });
    if (!settings) {
      settings = new settingsModel({ userId });
      await settings.save();
    }

    // Run the QTO engine
    const estimate = calculateEstimate(project.toObject(), settings.toObject());

    // Save the estimate on the project
    project.estimate = estimate;
    project.status = "completed";
    await project.save();

    return res.json({
      success: true,
      message: "Estimate calculated",
      estimate,
      project: {
        _id: project._id,
        name: project.name,
        status: project.status,
        rooms: project.rooms,
        walls: project.walls,
        planFile: project.planFile,
        scale: project.scale,
      },
    });
  } catch (error) {
    console.error("Estimate error:", error);
    return res.json({ success: false, message: error.message });
  }
};

//  Returns the previously-saved estimate for a project
export const getProjectEstimate = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const project = await projectModel.findOne({ _id: id, userId });
    if (!project) {
      return res.json({ success: false, message: "Project not found" });
    }

    const hasEstimate = project.estimate?.calculatedAt;
    if (!hasEstimate) {
      return res.json({
        success: false,
        needsCalculation: true,
        message: "No estimate yet. Run calculation first.",
        project: {
          _id: project._id,
          name: project.name,
          status: project.status,
          rooms: project.rooms,
          walls: project.walls,
          planFile: project.planFile,
          scale: project.scale,
        },
      });
    }

    return res.json({
      success: true,
      estimate: project.estimate,
      project: {
        _id: project._id,
        name: project.name,
        status: project.status,
        rooms: project.rooms,
        walls: project.walls,
        planFile: project.planFile,
        scale: project.scale,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
