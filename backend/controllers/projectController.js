import projectModel from '../models/projectModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

//  Creates a new project AND uploads its plan file.
export const createProject = async (req, res) => {
    try {
        const userId = req.userId;

        if (!req.file) {
            return res.json({ success: false, message: "No plan file uploaded" });
        }

        const { name, description } = req.body;

        const project = new projectModel({
            userId,
            name: name || 'Untitled Project',
            description: description || '',
            status: 'draft',
            planFile: {
                filename:     req.file.filename,
                originalName: req.file.originalname,
                path:         `uploads/plans/${req.file.filename}`,
                mimetype:     req.file.mimetype,
                size:         req.file.size
            }
        });

        await project.save();

        return res.json({
            success: true,
            message: 'Project created',
            project
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


//  Returns all projects belonging to the logged-in user.
//  Newest first

export const listProjects = async (req, res) => {
    try {
        const userId = req.userId;

        const projects = await projectModel
            .find({ userId })
            .select('name description status planFile estimate.totalCost createdAt updatedAt')
            .sort({ createdAt: -1 });

        return res.json({ success: true, projects });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


//  Returns one full project (rooms, walls, openings, estimate).

export const getProject = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const project = await projectModel.findOne({ _id: id, userId });
        if (!project) {
            return res.json({ success: false, message: "Project not found" });
        }

        return res.json({ success: true, project });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


//  Saves the scale calibration the user did on the Scale page.

export const updateScale = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const {
            pixelsPerMeter,
            method,
            manualScale,
            referenceLength,
            referencePixels,
            width,
            height
        } = req.body;

        const project = await projectModel.findOne({ _id: id, userId });
        if (!project) {
            return res.json({ success: false, message: "Project not found" });
        }

        // Update only the fields that were sent
        if (pixelsPerMeter !== undefined) {
            project.scale.pixelsPerMeter = pixelsPerMeter;
            project.scale.metersPerPixel = pixelsPerMeter > 0 ? 1 / pixelsPerMeter : 0;
        }
        if (method !== undefined)          project.scale.method          = method;
        if (manualScale !== undefined)     project.scale.manualScale     = manualScale;
        if (referenceLength !== undefined) project.scale.referenceLength = referenceLength;
        if (referencePixels !== undefined) project.scale.referencePixels = referencePixels;

        // Save image pixel dimensions when the frontend sends them
        if (width  !== undefined) project.planFile.width  = width;
        if (height !== undefined) project.planFile.height = height;

        await project.save();
        return res.json({ success: true, project });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


//  Saves the rooms / walls / openings the user drew in the Editor.
export const updateGeometry = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { rooms, walls, openings } = req.body;

        const project = await projectModel.findOne({ _id: id, userId });
        if (!project) {
            return res.json({ success: false, message: "Project not found" });
        }

        if (Array.isArray(rooms))    project.rooms = rooms;
        if (Array.isArray(walls))    project.walls = walls;
        if (Array.isArray(openings)) project.openings = openings;

        await project.save();
        return res.json({ success: true, project });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


//  Updates project name, description, or status

export const updateProject = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { name, description, status } = req.body;

        const project = await projectModel.findOne({ _id: id, userId });
        if (!project) {
            return res.json({ success: false, message: "Project not found" });
        }

        if (name !== undefined)        project.name        = name;
        if (description !== undefined) project.description = description;
        if (status !== undefined)      project.status      = status;

        await project.save();
        return res.json({ success: true, project });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


//  Deletes the project AND its plan file from disk.

export const deleteProject = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const project = await projectModel.findOne({ _id: id, userId });
        if (!project) {
            return res.json({ success: false, message: "Project not found" });
        }

        // Try to remove the file. We don't fail the request if unlink fails
        if (project.planFile?.filename) {
            const filePath = path.join(__dirname, '..', 'uploads', 'plans', project.planFile.filename);
            fs.unlink(filePath, (err) => {
                if (err) console.warn('Could not delete file:', filePath, err.message);
            });
        }

        await projectModel.deleteOne({ _id: id, userId });

        return res.json({ success: true, message: 'Project deleted' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
