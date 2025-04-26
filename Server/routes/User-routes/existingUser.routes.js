import { Router} from "express";
import { isUserExist , updateUserPassword} from "../../controllers/User-controllers/existingUser.controller.js";
import OTP_Generation_for_ForgotPass from "../../middlewares/ForgotPassOtpGeneration.middleware.js";
import OTP_Verification_for_ForgotPass from "../../middlewares/ForgotPassOtpVerification.middleware.js";


const router = Router()

router.route("/").post(isUserExist,OTP_Generation_for_ForgotPass)
router.route("/verify-otp").post(OTP_Verification_for_ForgotPass)
router.route("/resend-otp").post(OTP_Generation_for_ForgotPass, OTP_Verification_for_ForgotPass)
router.route("/reset-password").post(updateUserPassword)





export default router
