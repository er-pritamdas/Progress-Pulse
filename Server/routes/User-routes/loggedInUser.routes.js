import { Router} from "express";
import { isUserNamePresent, isPasswordCorrect } from "../../controllers/User-controllers/loggedinUser.controller.js";

const router = Router()

router.route("/").post(isUserNamePresent,isPasswordCorrect)





export default router
