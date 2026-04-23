import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessTokenAndRefreshToken } from "../utils/generateToken.js";
import {
  refreshCookieOptions,
  clearCookieOptions,
} from "../config/cookie.config.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Rating } from "../models/rating.model.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, skills, location, address } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User Already Exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    skills,
    location,
    address
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "User Registered successfully",
      ),
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id.toString());

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
        },
        "User loggedIn successfully",
      ),
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1
        }
      },
      { new: true }
    );
  }

  return res
    .status(200)
    .clearCookie("refreshToken", clearCookieOptions)
    .clearCookie("accessToken", clearCookieOptions)
    .json(new ApiResponse(200, {}, "User Logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    // 1. Check if token exists and is a valid string (not "undefined" or "null" from localstorage bugs)
    if (!incomingRefreshToken || incomingRefreshToken === "undefined" || incomingRefreshToken === "null") {
      return res.status(200).json(new ApiResponse(200, null, "No refresh token found. Silent skip."));
    }

    // 2. Verify JWT
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      );
    } catch (jwtErr) {
      return res.status(200).clearCookie("refreshToken", clearCookieOptions).json(new ApiResponse(200, null, "Session expired"));
    }

    // 3. Find User
    const user = await User.findById(decodedToken?._id);
    if (!user || incomingRefreshToken !== user?.refreshToken) {
       return res.status(200).clearCookie("refreshToken", clearCookieOptions).json(new ApiResponse(200, null, "Invalid session"));
    }

    // 4. Generate only new access token (Keep existing refresh token to avoid race conditions on rapid refresh)
    const accessToken = user.generateAccessToken();

    return res
      .status(200)
      .json(new ApiResponse(200, { accessToken }, "Session refreshed"));
      
  } catch (error: any) {
    console.error("Refresh Error:", error.message);
    return res.status(200).json(new ApiResponse(200, null, "Authentication failed. Clear session."));
  }
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { availability, skills, location } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        ...(availability !== undefined && { availability }),
        ...(skills && { skills }),
        ...(location && { location }),
      },
    },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.json(new ApiResponse(200, user, "Profile updated successfully"));
});

export const getAllVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await User.find({ role: 'volunteer' }).select("-password -refreshToken");
  return res.json(new ApiResponse(200, volunteers, "Volunteers fetched successfully"));
});

export const rateVolunteer = asyncHandler(async (req, res) => {
  const { volunteerId, rating } = req.body;
  const voterId = req.user?._id?.toString() || req.ip || "anonymous";

  if (!volunteerId || rating === undefined) {
    throw new ApiError(400, "Volunteer ID and rating are required");
  }

  const volunteer = await User.findById(volunteerId);
  if (!volunteer || volunteer.role !== "volunteer") {
    throw new ApiError(404, "Volunteer not found");
  }

  // 1. Upsert the rating (Update if exists, otherwise create)
  await Rating.findOneAndUpdate(
    { volunteerId, voterId },
    { rating: Number(rating) },
    { upsert: true, new: true }
  );

  // 2. Recalculate average (Most accurate method)
  const allRatings = await Rating.find({ volunteerId });
  const count = allRatings.length;
  const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
  const average = sum / count;

  const updatedVolunteer = await User.findByIdAndUpdate(
    volunteerId,
    {
      $set: {
        sumOfRatings: sum,
        totalRatings: count,
        rating: Math.round(average * 10) / 10,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res.json(new ApiResponse(200, updatedVolunteer, "Rating updated successfully"));
});
