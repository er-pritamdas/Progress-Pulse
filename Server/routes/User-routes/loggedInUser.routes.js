import { Router} from "express";
import { isUserNamePresent, isPasswordCorrect } from "../../controllers/User-controllers/loggedinUser.controller.js";
import { refreshTokenHandler } from "../../middlewares/JwtRefreshTokenValidation.middleware.js";

const router = Router()

router.route("/").post(isUserNamePresent,isPasswordCorrect)
router.route("/refresh-token").post(refreshTokenHandler)





export default router
