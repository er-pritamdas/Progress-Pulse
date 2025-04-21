import { Router} from "express";
import jwtAuthorization from "../../middlewares/JwtAuthorization.middleware.js";
import { fetchHabitTableData, newHabitTableEntry } from "../../controllers/Habit-controllers/HabitTableEntry.controller.js";


const router = Router()

// router.route("/").get(jwtAuthorization, ) // Habit.controller.js
router.route("/table-entry").get(jwtAuthorization, fetchHabitTableData)
router.route("/table-entry").post(jwtAuthorization, newHabitTableEntry)
// router.route("/table-entry").put(jwtAuthorization, )
// router.route("/table-entry").delete(jwtAuthorization, )









export default router
