// Import Statements
import {Router} from "express";
import {isUserPresent, newUserEntry} from "../../controllers/User-controllers/registeredUser.controller.js";
import OTP_Generation from "../../middlewares/OtpGeneration.middleware.js";
import OTP_Verification from "../../middlewares/OtpVerification.middleware.js";

// Variables
const router = Router()

//Routes
router.route("/").post(isUserPresent, newUserEntry, OTP_Generation)
router.route("/verify-otp").post(OTP_Verification)
router.route("/resend-otp").post(OTP_Generation, OTP_Verification)

// Exports
export default router