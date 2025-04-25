import { Router} from "express";
import {verifyToken} from "../../middlewares/JwtAuthorization.middleware.js";
import { readHabitTableData, createHabitTableEntry, updateHabitTableEntry, deleteHabitTableEntry } from "../../controllers/Habit-controllers/HabitTableEntry.controller.js";


const router = Router()

// router.route("/").get(jwtAuthorization, ) // Habit.controller.js
router.route("/table-entry").post(verifyToken, createHabitTableEntry)
router.route("/table-entry").get(verifyToken, readHabitTableData)
router.route("/table-entry").put(verifyToken, updateHabitTableEntry)
router.route("/table-entry").delete(verifyToken, deleteHabitTableEntry)


// router.route("/table-entry").put(jwtAuthorization, )
// router.route("/table-entry").delete(jwtAuthorization, )









export default router
