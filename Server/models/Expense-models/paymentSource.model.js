import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";

dotenv.config({ path: "./.env" });

// Use a specific database for Expenses if configured, otherwise default to "Pulse_Expense"
// Note: Ideally add EXPENSE_DB to your .env file
const ExpenseDB = mongoose.connection.useDb(process.env.EXPENSE_DB || "Pulse_Expense");

const paymentSourceSchema = new mongoose.Schema({
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
    type: {
        type: String,
        enum: ["Bank", "Wallet", "Card"],
        default: "Bank"
    },
    balance: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Prevent duplicate source names for the same user
paymentSourceSchema.index({ userId: 1, name: 1 }, { unique: true });

const PaymentSource = ExpenseDB.model("PaymentSource", paymentSourceSchema);

console.log("---------------------------------------------------------------");
console.log(`✅ Pulse/${ExpenseDB.name}/PaymentSource Connected`);
console.log("---------------------------------------------------------------");

export default PaymentSource;
