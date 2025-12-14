import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";
import PaymentSource from "./paymentSource.model.js";
import ExpenseCategory from "./expenseCategory.model.js";

dotenv.config({ path: "./.env" });

const ExpenseDB = mongoose.connection.useDb(process.env.EXPENSE_DB || "Pulse_Expense");

const expenseTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: RegisteredUsers,
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    sourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: PaymentSource,
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ExpenseCategory
        // Required only for Debit
    },
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId
        // Required only for Debit
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        enum: ["Credit", "Debit"],
        default: "Debit"
    },
    isReimbursable: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for fast querying by month (using range on date)
expenseTransactionSchema.index({ userId: 1, date: 1 });

const ExpenseTransaction = ExpenseDB.model("ExpenseTransaction", expenseTransactionSchema);

console.log("---------------------------------------------------------------");
console.log(`✅ Pulse/${ExpenseDB.name}/ExpenseTransaction Connected`);
console.log("---------------------------------------------------------------");

export default ExpenseTransaction;
