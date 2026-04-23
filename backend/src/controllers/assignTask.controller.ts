import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Assignment } from "../models/assignment.model.js";
import { redis } from "../config/redis.js";
import { deleteByPattern } from "../utils/redis.utils.js";

export const assignVolunteer = asyncHandler(async (req, res) => {
  const { taskId, volunteerId } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const assignmentCount = await Assignment.countDocuments({ task: taskId });

  if (assignmentCount >= task.volunteersNeeded) {
    throw new ApiError(400, "Task already full");
  }

  const exsiting = await Assignment.findOne({
    task: taskId,
    volunteer: volunteerId,
  });

  if (exsiting) {
    throw new ApiError(400, "Volunteer already assigned to this task");
  }

  // Block assignment if the volunteer is already working on another task
  const activeAssignment = await Assignment.findOne({
    volunteer: volunteerId,
    status: { $in: ["assigned", "accepted"] },
  });

  if (activeAssignment) {
    throw new ApiError(400, "Volunteer already assigned to another task");
  }


  const assignment = await Assignment.create({
    task: taskId,
    volunteer: volunteerId,
  });

  task.assignedCount += 1;

  if (task.assignedCount === task.volunteersNeeded) {
    task.status = "in-progress";
  }

  await task.save();

  await deleteByPattern("tasks:*");
  await deleteByPattern("assignments:*");

  return res.json(
    new ApiResponse(200, assignment, "Volunteer assigned successfully"),
  );
});

export const updateAssignmentStatus = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { status } = req.body;

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }


  if (assignment.volunteer.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Not allowed");
  }

  assignment.status = status;

  await assignment.save();

  await deleteByPattern("tasks:*");
  await deleteByPattern("assignments:*");

  return res.json(
    new ApiResponse(200, assignment, "Assignment updated")
  );
});

export const getMyAssignments = asyncHandler(async (req, res) => {
  const cacheKey = `assignments:${req.user?._id}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(new ApiResponse(200, JSON.parse(cached), "My assignments fetched from cache"));
  }

  const assignments = await Assignment.find({
    volunteer: req.user?._id,
  })
    .populate("task", "title description location priority status address")
    .populate('volunteer', 'name email')
    .sort({ createdAt: -1 });

  await redis.set(cacheKey, JSON.stringify(assignments), "EX", 60);

  return res.json(
    new ApiResponse(200, assignments, "My assignments fetched")
  );
});

export const getTaskAssignments = asyncHandler(async (req, res) => {
  const { taskId } = req.params as { taskId: string };

  const assignments = await Assignment.find({ task: taskId })
    .populate('volunteer', 'name email skills')
    .sort({ createdAt: -1 });

  return res.json(
    new ApiResponse(200, assignments, "Task assignments fetched")
  );
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params as { assignmentId: string };

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new ApiError(404, "Assignment not found");
  }


  const task = await Task.findById(assignment.task);
  if (task) {
    task.assignedCount = Math.max(0, task.assignedCount - 1);
    if (task.assignedCount < task.volunteersNeeded) {
        task.status = "open";
    }
    await task.save();
  }

  await assignment.deleteOne();

  await deleteByPattern("tasks:*");
  await deleteByPattern("assignments:*");

  return res.json(
    new ApiResponse(200, {}, "Assignment deleted successfully")
  );
});