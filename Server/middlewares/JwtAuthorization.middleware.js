import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const verifyToken = asyncHandler(
    async(req, res, next) => {
        const authHeader = req.headers.authorization;
      
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ message: "No token provided" });
        }
      
        const token = authHeader.split(" ")[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
          const username = decoded["username"];
        //   req.user = username // Now you can access req.user.id, etc.
          // next();
          return res.status(200).json(
              new ApiResponse(200, username, "token Verified")
          ) 
        } catch (error) {
          throw new ApiError(401, error.message);
        }
      }
)

export default verifyToken;
