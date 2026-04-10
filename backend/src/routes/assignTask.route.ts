import express from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { assignVolunteer, getMyAssignments, updateAssignmentStatus, getTaskAssignments, deleteAssignment } from '../controllers/assignTask.controller.js';
const router = express.Router()



router.post("/assign", verifyJwt, authorizeRoles("admin"), assignVolunteer);


router.delete("/:assignmentId", verifyJwt, authorizeRoles("admin"), deleteAssignment);


router.patch(
  "/:assignmentId",
  verifyJwt,
  authorizeRoles("volunteer"),
  updateAssignmentStatus,
);


router.get("/my", verifyJwt, authorizeRoles("volunteer"), getMyAssignments);


router.get("/:taskId", verifyJwt, getTaskAssignments);

export default router
