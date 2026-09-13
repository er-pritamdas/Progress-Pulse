import asynchandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import logger from "../../utils/Logging.js";

// Habit Models
import HabitTracker from "../../models/Habit-models/habitTracker.model.js";
import FoodLog from "../../models/Habit-models/foodLog.model.js";
import PhysicalLog from "../../models/Habit-models/physicalLog.model.js";
import HabitSettings from "../../models/Habit-models/habitSettings.model.js";

// Expense Models
import ExpenseTransaction from "../../models/Expense-models/expenseTransaction.model.js";
import MonthlyBudget from "../../models/Expense-models/monthlyBudget.model.js";

// Investment Models
import StockTrade from "../../models/Investment-models/stockTrade.model.js";
import MutualFund from "../../models/Investment-models/mutualFund.model.js";
import MutualFundGroup from "../../models/Investment-models/mutualFundGroup.model.js";
import FixedDeposit from "../../models/Investment-models/fixedDeposit.model.js";
import FixedDepositGroup from "../../models/Investment-models/fixedDepositGroup.model.js";
import RecurringDeposit from "../../models/Investment-models/recurringDeposit.model.js";
import RecurringDepositGroup from "../../models/Investment-models/recurringDepositGroup.model.js";
import PfWithdrawal from "../../models/Investment-models/pfWithdrawal.model.js";
import Salary from "../../models/Investment-models/salary.model.js";

/**
 * Reset all Habit Tracker data for authenticated user
 */
const resetHabitData = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized user");
    }

    logger.warn(`DANGER ZONE: User ${req.user.username} is resetting Habit Tracker data.`);

    await Promise.all([
        HabitTracker.deleteMany({ userId }),
        FoodLog.deleteMany({ userId }),
        PhysicalLog.deleteMany({ userId }),
        HabitSettings.deleteMany({ userId })
    ]);

    return res.status(200).json(
        new ApiResponse(200, null, "Habit Tracker data has been completely reset.")
    );
});

/**
 * Reset all Expense Tracker data for authenticated user
 */
const resetExpenseData = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized user");
    }

    logger.warn(`DANGER ZONE: User ${req.user.username} is resetting Expense Tracker data.`);

    await Promise.all([
        ExpenseTransaction.deleteMany({ userId }),
        MonthlyBudget.deleteMany({ userId })
    ]);

    return res.status(200).json(
        new ApiResponse(200, null, "Expense Tracker data has been completely reset.")
    );
});

/**
 * Reset all Investment Tracker data for authenticated user
 */
const resetInvestmentData = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized user");
    }

    logger.warn(`DANGER ZONE: User ${req.user.username} is resetting Investment Tracker data.`);

    await Promise.all([
        StockTrade.deleteMany({ userId }),
        MutualFund.deleteMany({ userId }),
        MutualFundGroup.deleteMany({ userId }),
        FixedDeposit.deleteMany({ userId }),
        FixedDepositGroup.deleteMany({ userId }),
        RecurringDeposit.deleteMany({ userId }),
        RecurringDepositGroup.deleteMany({ userId }),
        PfWithdrawal.deleteMany({ userId }),
        Salary.deleteMany({ userId })
    ]);

    return res.status(200).json(
        new ApiResponse(200, null, "Investment Tracker data has been completely reset.")
    );
});

/**
 * Factory Reset: Reset all tracker data for authenticated user
 */
const resetAllTrackerData = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized user");
    }

    logger.warn(`DANGER ZONE: User ${req.user.username} is executing a complete factory wipe of all tracker data.`);

    await Promise.all([
        // Habit
        HabitTracker.deleteMany({ userId }),
        FoodLog.deleteMany({ userId }),
        PhysicalLog.deleteMany({ userId }),
        HabitSettings.deleteMany({ userId }),
        // Expense
        ExpenseTransaction.deleteMany({ userId }),
        MonthlyBudget.deleteMany({ userId }),
        // Investment
        StockTrade.deleteMany({ userId }),
        MutualFund.deleteMany({ userId }),
        MutualFundGroup.deleteMany({ userId }),
        FixedDeposit.deleteMany({ userId }),
        FixedDepositGroup.deleteMany({ userId }),
        RecurringDeposit.deleteMany({ userId }),
        RecurringDepositGroup.deleteMany({ userId }),
        PfWithdrawal.deleteMany({ userId }),
        Salary.deleteMany({ userId })
    ]);

    return res.status(200).json(
        new ApiResponse(200, null, "All tracker data has been wiped clean. Account reset to blank slate.")
    );
});

export {
    resetHabitData,
    resetExpenseData,
    resetInvestmentData,
    resetAllTrackerData
};
