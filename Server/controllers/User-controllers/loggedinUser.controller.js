import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asynchandler from "../../utils/asyncHandler.js";
import RegisteredUsers from "../../models/User-models/registeredUser.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const isUserNamePresent = asynchandler(
    async (req, res, next) => {
        const { username, password } = req.body
        if (!username) {
            throw new ApiError(400, "Username is required")
        }
        if (!password) {
            throw new ApiError(400, "Password is required")
        }
        const userExist = await RegisteredUsers.findOne({ username: username })
        if (!userExist) {
            throw new ApiError(404, "User Not Found")
        }
        req.user = userExist
        next()
    }
)

const isPasswordCorrect = asynchandler(
    async (req, res, next) => {
        const { password } = req.body;
        const user = req.user;

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new ApiError(401, "Password is incorrect");
        }
        if (isMatch) {
            if (user.isVerified != true) {
                throw new ApiError(401, "User Not Verified", [{ "isVerified": user.isVerified }]);
            }
        }

        // Update user login status
        user.lastLogin = Date.now();
        user.isLoggedIn = true;

        // Generate the access token and refresh token
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save user data
        await user.save();

        // Send refresh token as secure, HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // Set secure flag only in production
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Send the response with access token
        return res.status(200).json(
            new ApiResponse(200, { user, accessToken }, "User Logged In Successfully")
        );
    }
)


//---------------------------------- Helper Functions-----------------------------------

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET_KEY,  // Secret for access token
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } // Access token expires in 15 minutes
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET_KEY, // Secret for refresh token
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } // Refresh token expires in 7 days
    );
};

export { isUserNamePresent, isPasswordCorrect, generateAccessToken, generateRefreshToken }



