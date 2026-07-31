import { Router } from "express";
import { verifyToken } from "../../middlewares/JwtAuthorization.middleware.js";
// Habit Table entry Controller
import { readHabitTableData, createHabitTableEntry, updateHabitTableEntry, deleteHabitTableEntry } from "../../controllers/Habit-controllers/HabitTableEntry.controller.js";
// Habit Settings Controller
import { getHabitSettings, updateHabitSettings, resetHabitSettingsToDefault } from "../../controllers/Habit-controllers/HabitSettings.controller.js";
// Habit Physical Logging Controller
import { addPhysicalLog, getPhysicalLogs, deletePhysicalLog } from "../../controllers/Habit-controllers/HabitLogging.controller.js";
import { exportHabitDataToEmail } from "../../controllers/Habit-controllers/HabitExport.controller.js";
import { exportFoodLoggingDataToEmail } from "../../controllers/Habit-controllers/FoodExport.controller.js";

// Food Logging Controller
import {
  getFoodDatabase,
  createCustomFood,
  getDailyFoodLogs,
  getFoodLogsDateRange,
  logFoodItem,
  updateFoodLog,
  deleteFoodLog,
  deleteMealCategoryLogs,
} from "../../controllers/Habit-controllers/FoodLogging.controller.js";

const router = Router();

// Habit Table Entry Routes
router.route("/table-entry").post(verifyToken, createHabitTableEntry);
router.route("/table-entry").get(verifyToken, readHabitTableData);
router.route("/table-entry").put(verifyToken, updateHabitTableEntry);
router.route("/table-entry").delete(verifyToken, deleteHabitTableEntry);

// Habit Setting Routes
router.route("/settings").get(verifyToken, getHabitSettings);
router.route("/settings").put(verifyToken, updateHabitSettings);
router.route("/settings").delete(verifyToken, resetHabitSettingsToDefault);

// Export Routes
router.route("/export").post(verifyToken, exportHabitDataToEmail);
router.route("/food/export").post(verifyToken, exportFoodLoggingDataToEmail);

// Habit Physical Logging Routes
router.route("/logging").post(verifyToken, addPhysicalLog);
router.route("/logging").get(verifyToken, getPhysicalLogs);
router.route("/logging/:logId").delete(verifyToken, deletePhysicalLog);

// Food Database & Daily Food Logging Routes
router.route("/food/database").get(verifyToken, getFoodDatabase);
router.route("/food/database").post(verifyToken, createCustomFood);

router.route("/food/log").get(verifyToken, getDailyFoodLogs);
router.route("/food/range-logs").get(verifyToken, getFoodLogsDateRange);
router.route("/food/log").post(verifyToken, logFoodItem);
router.route("/food/meal-category").delete(verifyToken, deleteMealCategoryLogs);
router.route("/food/log/:id").put(verifyToken, updateFoodLog);
router.route("/food/log/:id").delete(verifyToken, deleteFoodLog);

export default router;
