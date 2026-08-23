import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";

dotenv.config({ path: "./.env" });

const InvestmentDB = mongoose.connection.useDb(
  process.env.INVESTMENT_DB || "Investment-Tracker"
);

const fixedDepositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: RegisteredUsers,
      required: true,
      index: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    fdNumber: {
      type: String,
      default: "",
      trim: true,
    },
    schemeName: {
      type: String,
      default: "Regular FD",
      trim: true,
    },

    // --- DEPOSITED (BUY SIDE) ---
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    interestRate: {
      type: Number,
      required: true,
      default: 7.0,
    },
    tenureYears: {
      type: Number,
      default: 1,
    },
    tenureMonths: {
      type: Number,
      default: 0,
    },
    tenureDays: {
      type: Number,
      default: 0,
    },
    tenureText: {
      type: String,
      default: "1 Year",
    },
    tenureValue: {
      type: Number,
      default: 1,
    },
    tenureUnit: {
      type: String,
      default: "Years",
    },
    startDate: {
      type: String,
      required: true,
    },
    maturityDate: {
      type: String,
      required: true,
    },
    maturityAmount: {
      type: Number,
      default: 0,
    },
    compoundingFrequency: {
      type: String,
      default: "Quarterly",
    },

    // --- WITHDRAWAL (SELL / SETTLEMENT SIDE - SOLD ONCE) ---
    isWithdrawn: {
      type: Boolean,
      default: false,
    },
    withdrawalDate: {
      type: String,
      default: "",
    },
    withdrawalType: {
      type: String,
      default: "Full Maturity Liquidation",
    },
    realizedPrincipal: {
      type: Number,
      default: 0,
    },
    realizedInterest: {
      type: Number,
      default: 0,
    },
    penalty: {
      type: Number,
      default: 0,
    },
    totalPayout: {
      type: Number,
      default: 0,
    },
    realizedGain: {
      type: Number,
      default: 0,
    },
    realizedReturnPercent: {
      type: Number,
      default: 0,
    },
    withdrawalNotes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Matured", "Withdrawn", "Closed"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

fixedDepositSchema.index({ userId: 1, createdAt: -1 });

const FixedDeposit = InvestmentDB.model("FixedDeposit", fixedDepositSchema);

console.log("---------------------------------------------------------------");
console.log(`✅ Pulse/${InvestmentDB.name}/FixedDeposit Connected`);
console.log("---------------------------------------------------------------");

export default FixedDeposit;
