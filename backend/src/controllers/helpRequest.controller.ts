import { HelpRequest } from "../models/helpRequest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { translateToLanguages } from "../services/ai.service.js";

export const createHelpRequest = asyncHandler(async (req, res) => {
  const { name, phone, description, location, volunteersNeeded, priority } = req.body;

  if (!name || !phone || !description || !location || !location.address || !location.coordinates) {
    throw new ApiError(400, "All fields are required including location and coordinates");
  }

  const translations = await translateToLanguages(description);

  const helpRequest = await HelpRequest.create({
    name,
    phone,
    description,
    descriptionEnglish: translations.english,
    descriptionHindi: translations.hindi,
    location,
    volunteersNeeded,
    priority,
    status: "pending",
  });

  return res.status(201).json(new ApiResponse(201, helpRequest, "Help request submitted successfully"));
});

export const getAllHelpRequests = asyncHandler(async (req, res) => {
  const helpRequests = await HelpRequest.find({})
    .populate("linkedTask", "title status")
    .sort({ createdAt: -1 });

  return res.json(new ApiResponse(200, helpRequests, "Help requests fetched"));
});

export const updateHelpRequestStatus = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { status, linkedTask } = req.body;

  const request = await HelpRequest.findById(requestId);
  if (!request) throw new ApiError(404, "Help request not found");

  if (status) request.status = status;
  if (linkedTask) request.linkedTask = linkedTask;

  await request.save();

  return res.json(new ApiResponse(200, request, "Help request updated"));
});

export const deleteHelpRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request = await HelpRequest.findByIdAndDelete(requestId);
  if (!request) throw new ApiError(404, "Help request not found");

  return res.json(new ApiResponse(200, {}, "Help request deleted permanently"));
});
