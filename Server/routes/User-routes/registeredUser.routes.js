import {Router} from "express";
import {isUserPresent, newUserEntry} from "../../controllers/User-controllers/newUserEntry.controller.js";
import OTP_Generation from "../../middlewares/OtpGeneration.middleware.js";

const router = Router()


router.route("/").post(isUserPresent, newUserEntry)
// router.route("/").post(isUserPresent, OTP_Generation, newUserEntry)



export default router