import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";

dotenv.config({ path: "./.env" });

const ExpenseDB = mongoose.connection.useDb(process.env.EXPENSE_DB || "Pulse_Expense");

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    budget: {
        type: Number,
        default: 0,
        min: 0
    },
    month: {
        type: String, // Format: "YYYY-MM"
        trim: true
    }
});

const expenseCategorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: RegisteredUsers,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    month: {
        type: String, // Format "YYYY-MM"
        trim: true
    },
    subCategories: [subCategorySchema]
}, { timestamps: true });

// Prevent duplicate categories for same user in same month (Global categories have no month)
expenseCategorySchema.index({ userId: 1, name: 1, month: 1 }, { unique: true });

const ExpenseCategory = ExpenseDB.model("ExpenseCategory", expenseCategorySchema);

console.log("---------------------------------------------------------------");
console.log(`✅ Pulse/${ExpenseDB.name}/ExpenseCategory Connected`);
console.log("---------------------------------------------------------------");

export default ExpenseCategory;
