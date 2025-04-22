import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import asynchandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { generateAccessToken, generateRefreshToken } from '../controllers/User-controllers/loggedinUser.controller.js'
import RegisteredUsers from '../models/User-models/registeredUser.model.js';

// Refresh Token Route
const refreshTokenHandler = asynchandler(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken; // Get the refresh token from cookie

    if (!refreshToken) {
        throw new ApiError(401, "Refresh Token is missing");
    }

    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
        const user = await RegisteredUsers.findById(decoded.id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        // Generate a new access token
        const accessToken = generateAccessToken(user);

        // Send the new access token
        return res.status(200).json(
            new ApiResponse(200, accessToken, "Token refreshed successfully")
        );

    } catch (err) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }
});


export {refreshTokenHandler};