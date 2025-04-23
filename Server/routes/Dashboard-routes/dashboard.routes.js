import { Router} from "express";
import {verifyToken}  from "../../middlewares/JwtAuthorization.middleware.js";
import { autoLogin } from "../../middlewares/JwtAuthorization.middleware.js";


const router = Router()

router.route("/auto-login").get(autoLogin)
router.route("/").get(verifyToken)





export default router
