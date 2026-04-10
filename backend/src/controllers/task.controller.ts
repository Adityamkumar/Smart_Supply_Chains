import { Task } from "../models/task.model.js";
import { Assignment } from "../models/assignment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    requiredSkills,
    location,
    address,
    volunteersNeeded,
    priority,
  } = req.body;

  if (!title || !description || !location || !volunteersNeeded) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const task = await Task.create({
    title,
    description,
    requiredSkills,
    location,
    address,
    volunteersNeeded,
    priority,
    createdBy: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

export const deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params as { taskId: string };
    const task = await Task.findById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Delete associated assignments
    await Assignment.deleteMany({ task: taskId });
    await task.deleteOne();

    return res.json(new ApiResponse(200, {}, "Task deleted successfully"));
});

export const getAllTasks = asyncHandler(async (req, res) => {
  // Using aggregate to get real assignments count
  const tasks = await Task.aggregate([
    {
      $lookup: {
        from: "assignments", // check your collection name in mongo
        localField: "_id",
        foreignField: "task",
        as: "assignments"
      }
    },
    {
      $addFields: {
        assignedCount: { $size: "$assignments" }
      }
    },
    {
        $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "creator"
        }
    },
    {
        $unwind: {
            path: "$creator",
            preserveNullAndEmptyArrays: true
        }
    },
    {
      $project: {
        assignments: 0,
        "creator.password": 0,
        "creator.refreshToken": 0
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);

  return res.json(new ApiResponse(200, tasks, "All tasks fetched"));
});

export const getOpenTasks = asyncHandler(async (req, res) => {
    // Similar to getAllTasks but with filter
    const tasks = await Task.aggregate([
        {
          $lookup: {
            from: "assignments",
            localField: "_id",
            foreignField: "task",
            as: "assignments"
          }
        },
        {
          $addFields: {
            assignedCount: { $size: "$assignments" }
          }
        },
        {
            $match: {
                status: { $ne: 'completed' },
                $or: [
                    { status: "open" },
                    { $expr: { $lt: ["$assignedCount", "$volunteersNeeded"] } }
                ]
            }
        },
        {
          $project: { assignments: 0 }
        }
    ]);

  return res.json(new ApiResponse(200, tasks, "Open tasks fetched"));
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { taskId } = req.params as { taskId: string };
  const { status } = req.body;

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  if (task.status === "completed") {
    throw new ApiError(400, "Completed tasks cannot be modified");
  }

  task.status = status;
  await task.save();

  return res.json(new ApiResponse(200, task, "Task status updated"));
});

export const getNearbyTasks = asyncHandler(async (req, res) => {
  const { lng, lat } = req.query;

  if (typeof lng !== "string" || typeof lat !== "string") {
    throw new ApiError(400, "Invalid coordinates");
  }

  const longitude = Number(lng);
  const latitude = Number(lat);

  if (isNaN(longitude) || isNaN(latitude)) {
    throw new ApiError(400, "Invalid numeric values");
  }

  const tasks = await Task.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: 5000,
      },
    },
  });

  return res.json(
    new ApiResponse(200, tasks, "Nearby tasks fetched")
  );
});