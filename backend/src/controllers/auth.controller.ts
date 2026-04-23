import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";
import { redis } from "../config/redis.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAccessTokenAndRefreshToken } from "../utils/generateToken.js";
import {
  accessCookieOptions,
  refreshCookieOptions,
  clearCookieOptions,
} from "../config/cookie.config.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, skills, location } = req.body;

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
    .cookie("accessToken", accessToken, accessCookieOptions)
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
  // const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ", "");
  // if (token) {
  //   try {
  //     const decoded: any = jwt.decode(token);
  //     if (decoded && decoded.exp) {
  //       const currentTime = Math.floor(Date.now() / 1000);
  //       const expiryTime = decoded.exp - currentTime;
  //       if (expiryTime > 0) {
  //         await redis.set(`blacklist:${token}`, "1", "EX", expiryTime);
  //       }
  //     }
  //   } catch (e) {}
  // }

  await User.findByIdAndUpdate(
    req.user._id,
    {
       $unset:{
         refreshToken: 1
       }
    },
    {
       new: true
    }
  )
  return res
    .status(200)
    .clearCookie("accessToken", clearCookieOptions)
    .clearCookie("refreshToken", clearCookieOptions)
    .json(new ApiResponse(200, {}, "User Logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    );

    const user = await User.findById((decodedToken as jwt.JwtPayload)._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken:newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id.toString());

    return res
      .status(200)
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
      .json(new ApiResponse(200, {accessToken, newRefreshToken}, "Access token is Refreshed"));
  } catch (error) {
    throw new ApiError(401,"Invalid refresh token");
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
