// Imports
import asyncHandler from "../utils/asyncHandler.js";
import RegisteredUsers from "../models/User-models/registeredUser.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import nodemailer from "nodemailer";
import logger from "../utils/Logging.js";

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate and Send OTP
const generateAndStoreOTP = asyncHandler(
  async (req, res) => {

    const { username } = req.body;
    logger.info("");
    logger.info(`USER - ${username}`);
    logger.info("---------- Generate & Send OTP ----------");
    logger.info("API HIT -> /api/v1/users/registered/");

    if (!username) {
      logger.warn("Validation Error: Username is missing");
      throw new ApiError(400, "Username is required");
    }

    const user = await RegisteredUsers.findOne({ username });

    if (!user) {
      logger.warn(`User Not Found: No user exists with username '${username}'`);
      throw new ApiError(409, "User not found");
    }

    logger.info(`User '${username}' found. Generating OTP...`);
    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = OTP;
    user.otpValidTill = Date.now() + 5 * 60 * 1000;
    await user.save();
    logger.info(`OTP generated and stored for user '${username}'`);
    logger.info(`OTP: ${OTP} (valid for 5 minutes)`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "🔐 Your OTP Code - Progress Pulse",
      html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #121212; color: #ffffff; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background-color: #1e1e1e; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
              <h2 style="color: #00DFA2; text-align: center;">Welcome to Progress Pulse</h2>
              <p style="font-size: 16px; color: #cccccc;">Hi <strong>${user.username}</strong>,</p>
              <p style="font-size: 16px; color: #cccccc;">Use the OTP below to complete your verification:</p>
              <div style="margin: 20px auto; background-color: #222; padding: 15px; border-radius: 8px; text-align: center;">
                <h1 style="font-size: 36px; letter-spacing: 4px; color: #00DFA2;">${OTP}</h1>
              </div>
              <p style="font-size: 14px; color: #aaaaaa;">This OTP is valid for <strong>5 minutes</strong>. Please don’t share it with anyone.</p>
              <p style="font-size: 14px; color: #aaaaaa;">If you didn’t request this OTP, you can ignore this email safely.</p>
              <hr style="margin: 30px 0; border-color: #333;" />
              <p style="font-size: 12px; color: #555555; text-align: center;">
                &copy; ${new Date().getFullYear()} Progress Pulse. All rights reserved.
              </p>
            </div>
          </div>
        `
    };
    logger.info(`Sending OTP email to '${user.email}'`);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error(`Failed to send OTP email to '${user.email}': ${error.message}`, {
          stack: error.stack,
        });
        throw new ApiError(500, "Failed to send OTP email");
      }
      logger.info(`OTP email sent successfully to '${user.email}'`);
      res.status(201).json(new ApiResponse(201, "OTP Sent over Email"));
      logger.info("---------- OTP Process Complete ----------");
    });
  });

export default generateAndStoreOTP;
