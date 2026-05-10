import express from "express";
import userAuth from "../middleware/userAuth.js";
import { exportExcel, exportPdf } from "../controllers/exportController.js";

const exportRouter = express.Router();

// Both routes require login. The user can only export their own projects.
exportRouter.get("/:id/excel", userAuth, exportExcel);
exportRouter.get("/:id/pdf", userAuth, exportPdf);

export default exportRouter;
