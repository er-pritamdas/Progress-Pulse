import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import asynchandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { generateAccessToken, generateRefreshToken } from '../controllers/User-controllers/loggedinUser.controller.js'
import RegisteredUsers from '../models/User-models/registeredUser.model.js';

// Refresh Token Route
const refreshTokenHandler = asynchandler(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.headers?.['x-refresh-token'];

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

        // Generate new access and refresh tokens
        const accessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Update cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Send the new access token and refresh token
        return res.status(200).json(
            new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Token refreshed successfully")
        );

    } catch (err) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }
});


export {refreshTokenHandler};