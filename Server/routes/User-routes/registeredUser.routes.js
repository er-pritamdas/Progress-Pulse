import {Router} from "express";
import {isUserPresent, newUserEntry} from "../../controllers/User-controllers/registeredUser.controller.js";
import OTP_Generation from "../../middlewares/OtpGeneration.middleware.js";
import OTP_Verification from "../../middlewares/OtpVerification.middleware.js";


const router = Router()


// router.route("/").post(isUserPresent, newUserEntry)
router.route("/").post(isUserPresent, newUserEntry, OTP_Generation)
router.route("/verify-otp").post(OTP_Verification)




export default router