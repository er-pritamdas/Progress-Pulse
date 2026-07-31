import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";

dotenv.config({ path: "./.env" });

const ExpenseDB = mongoose.connection.useDb(process.env.EXPENSE_DB || "Pulse_Expense");

const monthlyBudgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: RegisteredUsers,
        required: true,
        index: true
    },
    month: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}$/ // Format: YYYY-MM
    },
    salary: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });

// Ensure one salary entry per month per user
monthlyBudgetSchema.index({ userId: 1, month: 1 }, { unique: true });

const MonthlyBudget = ExpenseDB.model("MonthlyBudget", monthlyBudgetSchema);

console.log("---------------------------------------------------------------");
console.log(`✅ Pulse/${ExpenseDB.name}/MonthlyBudget Connected`);
console.log("---------------------------------------------------------------");

export default MonthlyBudget;
