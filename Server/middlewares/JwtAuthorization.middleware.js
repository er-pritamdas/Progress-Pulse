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
      const userId = decoded["id"];
      const username = decoded["username"];
      let userExist = null;
      if (userId) {
        userExist = await RegisteredUsers.findById(userId);
      }
      if (!userExist && username) {
        userExist = await RegisteredUsers.findOne({ username: username });
      }
      if (!userExist) {
        throw new ApiError(401, "User not found");
      }
      req.user = userExist;
      const safeUser = userExist.toObject ? userExist.toObject() : { ...userExist };
      delete safeUser.passwordHash;
      return res.status(200).json(
        new ApiResponse(200, safeUser, "Authorized")
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
      const userId = decoded["id"];
      const username = decoded["username"];
      let userExist = null;
      if (userId) {
        userExist = await RegisteredUsers.findById(userId);
      }
      if (!userExist && username) {
        userExist = await RegisteredUsers.findOne({ username: username });
      }
      if (!userExist) {
        throw new ApiError(401, "User not found");
      }
      req.user = userExist;
      next();
    } catch (error) {
      throw new ApiError(401, error.message);
    }
  }
)

export { verifyToken, autoLogin }
