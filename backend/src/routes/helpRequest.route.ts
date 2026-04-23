import express from "express";
import mongoose from "mongoose";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  createHelpRequest,
  getAllHelpRequests,
  updateHelpRequestStatus,
  deleteHelpRequest,
} from "../controllers/helpRequest.controller.js";
import { HelpRequest } from "../models/helpRequest.model.js";
import { Assignment } from "../models/assignment.model.js";
import { Task } from "../models/task.model.js";

import { helpRequestLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();


router.post("/", helpRequestLimiter, createHelpRequest);


router.get("/all", verifyJwt, authorizeRoles("admin"), getAllHelpRequests);
router.get("/track/:phone", helpRequestLimiter, async (req, res) => {
  try {
    const { phone } = req.params;
    const requests = await HelpRequest.find({ phone: String(phone) }).sort({ createdAt: -1 });
    
    const results = await Promise.all(requests.map(async (request) => {
      // Retroactive translation for old requests
      if (!request.descriptionEnglish || !request.descriptionHindi) {
        try {
          const { translateToLanguages } = await import("../services/ai.service.js");
          const translations = await translateToLanguages(request.description);
          request.descriptionEnglish = translations.english;
          request.descriptionHindi = translations.hindi;
          await request.save();
        } catch (err) {
          console.error("Delayed Translation Failed:", err);
        }
      }

      let volunteers = [];
      if (request.linkedTask) {
        const { Rating } = await import("../models/rating.model.js");
        const assignments = await Assignment.find({ task: request.linkedTask }).populate('volunteer', 'name _id rating');
        
        volunteers = await Promise.all(assignments
          .filter((a: any) => a.volunteer)
          .map(async (a: any) => {
             const vol = a.volunteer.toObject();
             // Check if this voter (identified by phone) has already rated this volunteer
             const hasRated = await Rating.exists({ 
               volunteerId: vol._id, 
               voterId: String(phone) 
             });
             return { ...vol, alreadyRated: !!hasRated };
          }));
      }
      return { 
        ...request.toObject(), 
        assignedVolunteers: volunteers 
      };
    }));

    res.json({ statusCode: 200, data: results, message: "Fetched requests", success: true });
  } catch (error: any) {
    res.status(500).json({ statusCode: 500, message: error.message, success: false });
  }
});
router.patch("/:requestId", verifyJwt, authorizeRoles("admin"), updateHelpRequestStatus);
router.delete("/:requestId", verifyJwt, authorizeRoles("admin"), deleteHelpRequest);

export default router;
