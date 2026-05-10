import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  calculateProjectEstimate,
  getProjectEstimate,
} from "../controllers/estimateController.js";

const estimateRouter = express.Router();

// Both routes require authentication.
estimateRouter.post("/:id/calculate", userAuth, calculateProjectEstimate);
estimateRouter.get("/:id", userAuth, getProjectEstimate);

export default estimateRouter;
