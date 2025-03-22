import asyncHandler from "../utils/asyncHandler.js";
import RegisteredUsers from "../models/User-models/registeredUser.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import nodemailer from "nodemailer";

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
});

const generateAndStoreOTP = asyncHandler(async (req, res) => {
    const { username } = req.body;

    if (!username) {
        throw new ApiError(400, "Username is required");
    }

    // Find the user by username
    const user = await RegisteredUsers.findOne({ username });

    if (!user) {
        throw new ApiError(409, "User not found");
    }

    // Generate a 6-digit OTP
    const OTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in the database
    user.otp = OTP;
    await user.save();

    // Email Options
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender's email
        to: user.email, // Receiver's email
        subject: "Your OTP Code",
        text: `Hello ${user.username},\n\nYour OTP is: ${OTP}.\n\nThis OTP will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
    };

    // Send Email

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            throw new ApiError(500, "Failed to send OTP email");
        }

        return res.status(201).json(new ApiResponse(201, "OTP Sent over Email"));
    });

});

export default generateAndStoreOTP;
