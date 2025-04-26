import RegisteredUsers from "../models/User-models/registeredUser.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js";


const OtpVerficationForForgotPass = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email) {
        throw new ApiError(400, "Email requied");
    }
    if (!otp) {
        throw new ApiError(400, "OTP requied");
    }

    // Find user by email
    const user = await RegisteredUsers.findOne({ email });

    if (!user) {
        throw new ApiError(409, "User not found")
    }

    // Check if OTP is valid and not expired
    if (Date.now() > user.otpValidTill) {
        throw new ApiError(400, "OTP expired")
    }

    // Check if OTP matches
    if (user.otp !== otp) {
        throw new ApiError(409, "Invalid OTP")
    }

    // Nullify OTP and verify user
    user.otp = null;
    user.otpValidTill = null;
    user.isVerified = true;
    await user.save();

    return res.status(201).json(
        new ApiResponse(201, "OTP Verified")
    )
});

export default OtpVerficationForForgotPass;
