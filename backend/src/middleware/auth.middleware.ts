import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

interface JwtPayloadType {
  _id: string;
}

export const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("authorization")?.replace("Bearer ", "");

      console.log(token)
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as JwtPayloadType;

    console.log(decodedToken)
    const user = await User.findById(decodedToken?._id).select(
      "-passowrd -refreshToken",
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid accesss token");
  }
});
