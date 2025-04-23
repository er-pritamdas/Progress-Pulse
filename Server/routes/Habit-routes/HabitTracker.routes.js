import { Router} from "express";
import {verifyToken} from "../../middlewares/JwtAuthorization.middleware.js";
import { fetchHabitTableData, newHabitTableEntry, editHabitTableEntry, deleteHabitTableEntry } from "../../controllers/Habit-controllers/HabitTableEntry.controller.js";


const router = Router()

// router.route("/").get(jwtAuthorization, ) // Habit.controller.js
router.route("/table-entry").get(verifyToken, fetchHabitTableData)
router.route("/table-entry").post(verifyToken, newHabitTableEntry)
router.route("/table-entry").put(verifyToken, editHabitTableEntry)
router.route("/table-entry").delete(verifyToken, deleteHabitTableEntry)


// router.route("/table-entry").put(jwtAuthorization, )
// router.route("/table-entry").delete(jwtAuthorization, )









export default router
