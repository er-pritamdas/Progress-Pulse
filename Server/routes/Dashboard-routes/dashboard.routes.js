import { Router} from "express";
import jwtAuthorization  from "../../middlewares/JwtAuthorization.middleware.js";


const router = Router()

router.route("/").get(jwtAuthorization)





export default router
