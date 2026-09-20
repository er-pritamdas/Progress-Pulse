import asynchandler from "../../utils/asyncHandler.js";
import RegisteredUsers from "../../models/User-models/registeredUser.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import logger from "../../utils/Logging.js";

const getUserProfile = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const username = req.user?.username || req.query.username;

    let user = null;
    if (userId) {
        user = await RegisteredUsers.findById(userId).select("-passwordHash -otp -otpValidTill");
    } else if (username) {
        user = await RegisteredUsers.findOne({
            $or: [
                { username },
                { username: { $regex: new RegExp(`^${username.trim()}$`, "i") } }
            ]
        }).select("-passwordHash -otp -otpValidTill");
    }

    if (!user) {
        throw new ApiError(404, "User profile not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User profile retrieved successfully")
    );
});

const checkUsernameAvailability = asynchandler(async (req, res) => {
    const rawUsername = req.query.username;
    if (!rawUsername || !rawUsername.trim()) {
        throw new ApiError(400, "Username query parameter is required");
    }
    const cleanUsername = rawUsername.trim();
    const currentUserId = req.user?._id;

    // Check if it's the user's current username
    if (req.user?.username && req.user.username.toLowerCase() === cleanUsername.toLowerCase()) {
        return res.status(200).json(
            new ApiResponse(200, { available: true, isCurrent: true }, "This is your current username")
        );
    }

    // Format validation: 3-30 chars, alphanumeric + _ . -
    const usernameRegex = /^[a-zA-Z0-9_.-]{3,30}$/;
    if (!usernameRegex.test(cleanUsername)) {
        return res.status(200).json(
            new ApiResponse(200, { 
                available: false, 
                reason: "Username must be 3-30 characters (letters, numbers, _, ., -)" 
            }, "Invalid username format")
        );
    }

    const existingUser = await RegisteredUsers.findOne({
        _id: { $ne: currentUserId },
        username: { $regex: new RegExp(`^${cleanUsername}$`, "i") }
    });

    if (existingUser) {
        return res.status(200).json(
            new ApiResponse(200, { available: false, reason: "Username is already taken" }, "Username taken")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, { available: true }, "Username is available!")
    );
});

const updateUserProfile = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const currentUsername = req.user?.username;

    const {
        username,
        newUsername,
        fullName,
        profilePic,
        customAvatars,
        bio,
        phone,
        occupation,
        currency,
        dateOfBirth,
        currentPassword,
        newPassword
    } = req.body;

    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (profilePic !== undefined) updateFields.profilePic = profilePic;
    if (customAvatars !== undefined) updateFields.customAvatars = customAvatars;
    if (bio !== undefined) updateFields.bio = bio;
    if (phone !== undefined) updateFields.phone = phone;
    if (occupation !== undefined) updateFields.occupation = occupation;
    if (currency !== undefined) updateFields.currency = currency;
    if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth;

    // Handle username update with uniqueness check
    const candidateUsername = (newUsername !== undefined ? newUsername : username)?.trim();
    if (candidateUsername && candidateUsername.toLowerCase() !== currentUsername?.toLowerCase()) {
        const usernameRegex = /^[a-zA-Z0-9_.-]{3,30}$/;
        if (!usernameRegex.test(candidateUsername)) {
            throw new ApiError(400, "Username must be 3-30 characters containing only letters, numbers, underscores, dashes, or dots.");
        }

        const existingUser = await RegisteredUsers.findOne({
            _id: { $ne: userId || req.user?._id },
            username: { $regex: new RegExp(`^${candidateUsername}$`, "i") }
        });

        if (existingUser) {
            throw new ApiError(409, `Username "@${candidateUsername}" is already taken by another user. Please choose a different username.`);
        }

        updateFields.username = candidateUsername;
    }

    // Optional password change
    if (newPassword) {
        if (!currentPassword) {
            throw new ApiError(400, "Current password is required to set a new password");
        }
        const currentUser = await RegisteredUsers.findById(userId || req.user?._id);
        if (!currentUser) {
            throw new ApiError(404, "User not found");
        }
        const isMatch = await bcrypt.compare(currentPassword, currentUser.passwordHash);
        if (!isMatch) {
            throw new ApiError(401, "Current password does not match");
        }
        updateFields.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const filter = userId ? { _id: userId } : { username: currentUsername };
    const updatedUser = await RegisteredUsers.findOneAndUpdate(
        filter,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).select("-passwordHash -otp -otpValidTill");

    if (!updatedUser) {
        throw new ApiError(404, "User not found to update");
    }

    let newAccessToken = null;
    if (updateFields.username) {
        newAccessToken = jwt.sign(
            { id: updatedUser._id, username: updatedUser.username },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "7d" }
        );
    }

    logger.info(`Profile updated for user: ${updatedUser.username}`);

    const userObj = updatedUser.toObject();
    if (newAccessToken) {
        userObj.accessToken = newAccessToken;
    }

    return res.status(200).json(
        new ApiResponse(200, userObj, "User profile updated successfully")
    );
});

export { getUserProfile, updateUserProfile, checkUsernameAvailability };
