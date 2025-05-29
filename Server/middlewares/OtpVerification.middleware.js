// Imports
import RegisteredUsers from "../models/User-models/registeredUser.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../utils/Logging.js"; // ✅ Added logger

const OtpVerification = asyncHandler(async (req, res) => {
    const { username, otp } = req.body;

    logger.info("");
    logger.info(`USER - ${username}`);
    logger.info("---------- OTP Verification ----------");
    logger.info("API HIT -> /api/v1/users/registered/verify-otp");

    if (!username) {
        logger.warn("Validation Error: Username is missing");
        throw new ApiError(400, "Username required");
    }

    if (!otp) {
        logger.warn("Validation Error: OTP is missing");
        throw new ApiError(400, "OTP required");
    }

    const user = await RegisteredUsers.findOne({ username });

    if (!user) {
        logger.warn(`Not Found: User '${username}' not found`);
        throw new ApiError(409, "User not found");
    }

    if (Date.now() > user.otpValidTill) {
        logger.warn(`Expired OTP: OTP for '${username}' has expired`);
        throw new ApiError(400, "OTP expired");
    }

    if (user.otp !== otp) {
        logger.warn(`Invalid OTP: Provided OTP for '${username}' does not match`);
        throw new ApiError(409, "Invalid OTP");
    }

    user.otp = null;
    user.otpValidTill = null;
    user.isVerified = true;
    await user.save();

    logger.info(`Success: OTP verified for '${username}'`);

    res.status(201).json(
        new ApiResponse(201, "OTP Verified")
    );
    logger.info("---------- OTP Verification Complete ----------");
});

export default OtpVerification;
