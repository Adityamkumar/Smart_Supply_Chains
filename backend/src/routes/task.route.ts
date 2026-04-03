import express from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  createTask,
  getAllTasks,
  getNearbyTasks,
  getOpenTasks,
} from "../controllers/task.controller.js";
const router = express.Router();

router.post("/create", verifyJwt, authorizeRoles("admin"), createTask);
router.get("/all", verifyJwt, authorizeRoles("admin"), getAllTasks);
router.get("/open", verifyJwt, authorizeRoles("volunteer"), getAllTasks);
router.get("/open", verifyJwt, authorizeRoles("volunteer"), getOpenTasks);
router.get("/nearby", verifyJwt, authorizeRoles("volunteer"), getNearbyTasks);

export default router