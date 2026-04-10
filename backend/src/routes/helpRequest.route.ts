import express from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  createHelpRequest,
  getAllHelpRequests,
  updateHelpRequestStatus,
  deleteHelpRequest,
} from "../controllers/helpRequest.controller.js";

import { helpRequestLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();


router.post("/", helpRequestLimiter, createHelpRequest);


router.get("/all", verifyJwt, authorizeRoles("admin"), getAllHelpRequests);
router.patch("/:requestId", verifyJwt, authorizeRoles("admin"), updateHelpRequestStatus);
router.delete("/:requestId", verifyJwt, authorizeRoles("admin"), deleteHelpRequest);

export default router;
