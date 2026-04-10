import express from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { assignVolunteer, getMyAssignments, updateAssignmentStatus, getTaskAssignments, deleteAssignment } from '../controllers/assignTask.controller.js';
const router = express.Router()


// Admin assigns
router.post("/assign", verifyJwt, authorizeRoles("admin"), assignVolunteer);

// Admin deletes assignment
router.delete("/:assignmentId", verifyJwt, authorizeRoles("admin"), deleteAssignment);

// Volunteer updates status
router.patch(
  "/:assignmentId",
  verifyJwt,
  authorizeRoles("volunteer"),
  updateAssignmentStatus,
);

// Volunteer gets tasks
router.get("/my", verifyJwt, authorizeRoles("volunteer"), getMyAssignments);

// Get assignments for a task
router.get("/:taskId", verifyJwt, getTaskAssignments);

export default router
