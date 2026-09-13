import asynchandler from "../../utils/asyncHandler.js";
import RegisteredUsers from "../../models/User-models/registeredUser.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import bcrypt from "bcryptjs";
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

const updateUserProfile = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const username = req.user?.username || req.body.username;

    const {
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

    const filter = userId ? { _id: userId } : { username };
    const updatedUser = await RegisteredUsers.findOneAndUpdate(
        filter,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).select("-passwordHash -otp -otpValidTill");

    if (!updatedUser) {
        throw new ApiError(404, "User not found to update");
    }

    logger.info(`Profile updated for user: ${updatedUser.username}`);

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User profile updated successfully")
    );
});

export { getUserProfile, updateUserProfile };
