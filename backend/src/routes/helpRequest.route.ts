import express from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  createHelpRequest,
  getAllHelpRequests,
  updateHelpRequestStatus,
  deleteHelpRequest,
} from "../controllers/helpRequest.controller.js";

const router = express.Router();

// Public route
router.post("/", createHelpRequest);

// Admin only routes
router.get("/all", verifyJwt, authorizeRoles("admin"), getAllHelpRequests);
router.patch("/:requestId", verifyJwt, authorizeRoles("admin"), updateHelpRequestStatus);
router.delete("/:requestId", verifyJwt, authorizeRoles("admin"), deleteHelpRequest);

export default router;
