import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    requiredSkills,
    location,
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
    volunteersNeeded,
    priority,
    createdBy: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

export const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  return res.json(new ApiResponse(200, tasks, "All tasks fetched"));
});

export const getOpenTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ status: "open" });

  return res.json(new ApiResponse(200, tasks, "Open tasks fetched"));
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