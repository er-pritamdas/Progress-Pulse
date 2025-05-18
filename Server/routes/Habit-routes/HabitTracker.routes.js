import { Router} from "express";
import {verifyToken} from "../../middlewares/JwtAuthorization.middleware.js";
import { readHabitTableData, createHabitTableEntry, updateHabitTableEntry, deleteHabitTableEntry } from "../../controllers/Habit-controllers/HabitTableEntry.controller.js";
import { getHabitSettings, updateHabitSettings, resetHabitSettingsToDefault } from "../../controllers/Habit-controllers/HabitSettings.controller.js";

const router = Router()

// Habit Table Entry Routes
router.route("/table-entry").post(verifyToken, createHabitTableEntry)
router.route("/table-entry").get(verifyToken, readHabitTableData)
router.route("/table-entry").put(verifyToken, updateHabitTableEntry)
router.route("/table-entry").delete(verifyToken, deleteHabitTableEntry)

// Habit Setting Routes
router.route("/settings").get(verifyToken, getHabitSettings)
router.route("/settings").put(verifyToken, updateHabitSettings)
router.route("/settings").delete(verifyToken, resetHabitSettingsToDefault)



// Habit Dashboard Routes

// Habit Table View Routes

export default router
