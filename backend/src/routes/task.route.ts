import express from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  createTask,
  getAllTasks,
  getNearbyTasks,
  getOpenTasks,
  deleteTask,
  updateTaskStatus
} from "../controllers/task.controller.js";
const router = express.Router();

router.post("/create", verifyJwt, authorizeRoles("admin"), createTask);
router.get("/all", verifyJwt, authorizeRoles("admin"), getAllTasks);
router.get("/open", verifyJwt, authorizeRoles("volunteer", "admin"), getOpenTasks);
router.get("/nearby", verifyJwt, authorizeRoles("volunteer", "admin"), getNearbyTasks);
router.patch("/:taskId/status", verifyJwt, authorizeRoles("admin"), updateTaskStatus);
router.delete("/:taskId", verifyJwt, authorizeRoles("admin"), deleteTask);

export default router