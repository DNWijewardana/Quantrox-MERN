import express from 'express';
import userAuth from '../middleware/userAuth.js';
import upload from '../middleware/upload.js';
import {
    createProject,
    listProjects,
    getProject,
    updateScale,
    updateGeometry,
    updateProject,
    deleteProject
} from '../controllers/projectController.js';

const projectRouter = express.Router();

projectRouter.post('/create', userAuth, upload.single('plan'), createProject);
projectRouter.get ('/list', userAuth, listProjects);
projectRouter.get ('/:id', userAuth, getProject);
projectRouter.put ('/:id/scale', userAuth, updateScale);
projectRouter.put ('/:id/geometry', userAuth, updateGeometry);
projectRouter.put ('/:id', userAuth, updateProject);
projectRouter.delete('/:id', userAuth, deleteProject);

export default projectRouter;
