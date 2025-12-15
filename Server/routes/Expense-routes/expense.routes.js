import { Router } from "express";
import { verifyToken } from "../../middlewares/JwtAuthorization.middleware.js";
import {
    getDashboardData,
    createCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    createSource,
    updateSource,
    deleteSource,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateSalary,
    copyCategoriesFromLastMonth
} from "../../controllers/expense.controller.js";

const router = Router();

// Apply Auth Middleware to all routes
router.use(verifyToken);

// Dashboard Data
router.get("/get-all-data", getDashboardData);

// Salary
router.post("/salary", updateSalary);

// Categories
router.post("/category/copy-previous", copyCategoriesFromLastMonth);

router.route("/category")
    .post(createCategory);

router.route("/category/:id")
    .patch(updateCategory)
    .delete(deleteCategory);

// SubCategories
router.route("/category/:id/subcategory")
    .post(addSubCategory);

router.route("/category/:id/subcategory/:subId")
    .patch(updateSubCategory)
    .delete(deleteSubCategory);

// Money Sources
router.route("/source")
    .post(createSource);

router.route("/source/:id")
    .patch(updateSource)
    .delete(deleteSource);

// Transactions
router.route("/transaction")
    .post(addTransaction);

router.route("/transaction/:id")
    .patch(updateTransaction)
    .delete(deleteTransaction);

export default router;
