import { Router} from "express";

const router = Router()

router.route("/").post(isUserNamePresent,isPasswordCorrect,loggedInUserEntry,changeLastLogin)





export default router
