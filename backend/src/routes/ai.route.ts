import { Router } from "express";
import { autoAssignVolunteers } from "../controllers/ai.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();


router.post(
  "/auto-assign",
  verifyJwt,
  authorizeRoles("admin"),
  autoAssignVolunteers
);

export default router;