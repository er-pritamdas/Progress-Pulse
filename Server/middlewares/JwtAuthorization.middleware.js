import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import RegisteredUsers from "../models/User-models/registeredUser.model.js";

const autoLogin = asyncHandler(
  async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const username = decoded["username"];
      const userExist = await RegisteredUsers.findOne({ username: username })
      req.user = userExist
      return res.status(200).json(
        new ApiResponse(200, userExist, "Authorized")
      );
    } catch (error) {
      throw new ApiError(401, error.message);
    }
  }
)



const verifyToken = asyncHandler(
  async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const username = decoded["username"];
      const userExist = await RegisteredUsers.findOne({ username: username })
      req.user = userExist
      next();
    } catch (error) {
      throw new ApiError(401, error.message);
    }
  }
)

export { verifyToken, autoLogin }
