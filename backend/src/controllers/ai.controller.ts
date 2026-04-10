import { Assignment, type IAssignment } from "../models/assignment.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { getAIScore } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateDistance } from "../utils/calculateDistance.js";

export const autoAssignVolunteers = asyncHandler(async (req, res) => {
  const { taskId } = req.body;

  const task = await Task.findById(taskId);

  if (!task) throw new ApiError(404, "Task not found");

  const currentAssignmentsCount = await Assignment.countDocuments({ 
    task: task._id,
    status: { $ne: "rejected" }
  });


  const skillRegexes = (task.requiredSkills || []).map(skill => new RegExp(skill.trim(), 'i'));


  let volunteers = await User.find({
    role: "volunteer",
    availability: true,
    $or: [
        { skills: { $in: skillRegexes } },
        { skills: { $size: 0 } },
        { skills: "General Assistance" }
    ],
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: task.location.coordinates,
        },
        $maxDistance: 10000,
      },
    },
  }).limit(10);


  if (volunteers.length < 5) {
    const backupVolunteers = await User.find({
      role: "volunteer",
      availability: true,
      _id: { $nin: volunteers.map(v => v._id) }
    }).limit(20);
    volunteers = [...volunteers, ...backupVolunteers];
  }

  const assignments: any[] = [];
  const suggestions: any[] = [];
  let successfulAssignmentsCount = 0;

  for (const volunteer of volunteers) {
    const distance = calculateDistance(
      task.location.coordinates,
      volunteer.location.coordinates,
    );
    
    const isNearby = distance <= 10;


    const existing = await Assignment.findOne({
      task: task._id,
      volunteer: volunteer._id,
    });

    if (existing) {
       const existingWithDist = existing.toObject() as any;
       existingWithDist.distance = distance.toFixed(1);
       existingWithDist.isTooFar = !isNearby;

       existingWithDist.aiScore = existingWithDist.aiScore || 0;
       existingWithDist.aiReason = existingWithDist.aiReason || "Manually assigned candidate";
       assignments.push(existingWithDist);
       continue;
    }

    const aiResult = await getAIScore(task, volunteer, distance);

    if (isNearby && (currentAssignmentsCount + successfulAssignmentsCount < task.volunteersNeeded)) {
      const assignment = await Assignment.create({
        task: task._id,
        volunteer: volunteer._id,
        aiScore: aiResult.score || 0.5,
        aiReason: aiResult.reason || "High matching skills nearby",
      });
      
      const assignmentWithDist = assignment.toObject() as any;
      assignmentWithDist.distance = distance.toFixed(1);
      assignmentWithDist.isTooFar = false;
      
      assignments.push(assignmentWithDist);
      successfulAssignmentsCount++;
    } else {

      suggestions.push({
        volunteer,
        aiScore: aiResult.score || 0.4,
        aiReason: aiResult.reason || "Qualified candidate with matching skillset",
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

  return res.json(new ApiResponse(200, { assignments, suggestions }, "AI analysis completed"));
});
