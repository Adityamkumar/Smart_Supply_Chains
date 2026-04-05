import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";

export const generateAccessTokenAndRefreshToken = async (userId:string) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(400, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating tokens",
    );
  }
};
