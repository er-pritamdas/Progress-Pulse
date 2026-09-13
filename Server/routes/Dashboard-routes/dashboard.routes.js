import { Router } from "express";
import { verifyToken } from "../../middlewares/JwtAuthorization.middleware.js";
import { autoLogin } from "../../middlewares/JwtAuthorization.middleware.js";
import { getUserProfile, updateUserProfile } from "../../controllers/User-controllers/userProfile.controller.js";
import {
    resetHabitData,
    resetExpenseData,
    resetInvestmentData,
    resetAllTrackerData
} from "../../controllers/User-controllers/dangerZone.controller.js";

const router = Router();

router.route("/auto-login").get(autoLogin);
router.route("/").get(verifyToken);
router.route("/profile").get(verifyToken, getUserProfile).put(verifyToken, updateUserProfile);

// Danger Zone Reset Routes
router.route("/danger-zone/reset-habit").post(verifyToken, resetHabitData);
router.route("/danger-zone/reset-expense").post(verifyToken, resetExpenseData);
router.route("/danger-zone/reset-investment").post(verifyToken, resetInvestmentData);
router.route("/danger-zone/reset-all").post(verifyToken, resetAllTrackerData);

export default router;


