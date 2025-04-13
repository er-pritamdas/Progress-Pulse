import { Router} from "express";
import { logoutUser } from "../../controllers/User-controllers/loggedOutUser.controller.js";

const router = Router()

router.route("/").post(logoutUser);






export default router