import { Router} from "express";
import { isUserNamePresent, isPasswordCorrect } from "../../controllers/User-controllers/loggedinUser.controller";

const router = Router()

router.route("/").post(isUserNamePresent,isPasswordCorrect,loggedInUserEntry,changeLastLogin)





export default router
