import { Router} from "express";
import jwtAuthorization from "../../middlewares/JwtAuthorization.middleware.js";


const router = Router()

// router.route("/").get(jwtAuthorization, ) // Habit.controller.js
router.route("/table-entry").get(jwtAuthorization, )





export default router
