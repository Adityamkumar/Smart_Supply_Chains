import { Assignment, type IAssignment } from "../models/assignment.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { getAIScore } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateDistance } from "../utils/calculateDistance.js";
import { redis } from "../config/redis.js";

export const autoAssignVolunteers = asyncHandler(async (req, res) => {
  const { taskId } = req.body;

  const task = await Task.findById(taskId);

  if (!task) throw new ApiError(404, "Task not found");

  const currentAssignmentsCount = await Assignment.countDocuments({ 
    task: task._id,
    status: { $ne: "rejected" }
  });


  const skillRegexes = (task.requiredSkills || []).map(skill => new RegExp(skill.trim(), 'i'));

  // 1. Find ALL available volunteers
  let allAvailableVolunteers = await User.find({
    role: "volunteer",
    availability: true
  });

  const assignments: any[] = [];
  const suggestions: any[] = [];
  let successfulAssignmentsCount = 0;

  // Process and sort by distance/match
  const processedVolunteers = allAvailableVolunteers.map(volunteer => {
      const distance = calculateDistance(
          task.location.coordinates,
          volunteer.location.coordinates,
      );
      
      const matchesSkills = (volunteer.skills || []).some(skill => 
          (task.requiredSkills || []).some(req => new RegExp(req.trim(), 'i').test(skill))
      );

      return {
          volunteer,
          distance,
          matchesSkills,
          isNearby: distance <= 10
      };
  });

  // Sort: Nearby + Skills first, then Nearby, then Global Skills
  processedVolunteers.sort((a, b) => {
      if (a.isNearby && a.matchesSkills && !(b.isNearby && b.matchesSkills)) return -1;
      if (!(a.isNearby && a.matchesSkills) && b.isNearby && b.matchesSkills) return 1;
      if (a.isNearby && !b.isNearby) return -1;
      if (!a.isNearby && b.isNearby) return 1;
      if (a.matchesSkills && !b.matchesSkills) return -1;
      if (!a.matchesSkills && b.matchesSkills) return 1;
      return a.distance - b.distance;
  });

  for (const item of processedVolunteers) {
    const { volunteer, distance, isNearby, matchesSkills } = item;

    const existing = await Assignment.findOne({
      task: task._id,
      volunteer: volunteer._id,
    });

    if (existing) {
       const existingWithData = await Assignment.findById(existing._id).populate('volunteer', 'name email skills');
       if (existingWithData) {
           const existingWithDist = existingWithData.toObject() as any;
           existingWithDist.distance = distance.toFixed(1);
           existingWithDist.isTooFar = !isNearby;
           existingWithDist.aiScore = existingWithDist.aiScore || 0;
           existingWithDist.aiReason = existingWithDist.aiReason || "Already assigned to this task";
           assignments.push(existingWithDist);
       }
       continue;
    }

    // AI Scoring
    const cacheKey = `ai:${task._id}:${volunteer._id}`;
    let aiResult;
    const cachedAi = await redis.get(cacheKey);
    if (cachedAi) {
      aiResult = JSON.parse(cachedAi);
    } else {
      aiResult = await getAIScore(task, volunteer, distance);
      await redis.set(cacheKey, JSON.stringify(aiResult), "EX", 900);
    }

    // Auto-assign Logic: Strictly within 10km AND has capacity
    if (isNearby && (currentAssignmentsCount + successfulAssignmentsCount < task.volunteersNeeded)) {
      const assignment = await Assignment.create({
        task: task._id,
        volunteer: volunteer._id,
        aiScore: aiResult.score || 0.5,
        aiReason: aiResult.reason || "Nearby volunteer with matching skills",
      });
      
      const populated = await Assignment.findById(assignment._id).populate('volunteer', 'name email skills');
      const assignmentWithDist = populated?.toObject() as any;
      assignmentWithDist.distance = distance.toFixed(1);
      assignmentWithDist.isTooFar = false;
      
      assignments.push(assignmentWithDist);
      successfulAssignmentsCount++;
    } else {
      // Add to suggestions pool
      suggestions.push({
        volunteer,
        aiScore: aiResult.score || 0.4,
        aiReason: aiResult.reason || (matchesSkills ? "Good skill match for this task" : "Available to help"),
        distance: distance.toFixed(1),
        isTooFar: !isNearby
      });
    }
  }

  task.assignedCount = currentAssignmentsCount + successfulAssignmentsCount;
  if (task.assignedCount >= task.volunteersNeeded) {
    task.status = "in-progress";
  }
  await task.save();

  return res.json(new ApiResponse(200, { 
      assignments, 
      suggestions: suggestions.slice(0, 15) 
  }, "Best matches found"));
});
