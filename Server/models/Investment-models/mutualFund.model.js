import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";

dotenv.config({ path: "./.env" });

const InvestmentDB = mongoose.connection.useDb(
  process.env.INVESTMENT_DB || "Investment-Tracker"
);

const mfTransactionSchema = new mongoose.Schema(
  {
    term: {
      type: String,
      default: "Term 1",
    },
    type: {
      type: String,
      enum: ["SIP", "Lumpsum", "SWP", "Redemption", "Withdrawal"],
      default: "SIP",
    },
    date: {
      type: String,
      required: true,
    },
    amtDeposit: {
      type: Number,
      required: true,
      default: 0,
    },
    er: {
      type: Number,
      default: 0,
    },
    actualAmt: {
      type: Number,
      default: 0,
    },
    nav: {
      type: Number,
      default: 0,
    },
    units: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const mutualFundSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: RegisteredUsers,
      required: true,
      index: true,
    },
    amc: {
      type: String,
      required: true,
      trim: true,
    },
    schemeName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: "Equity",
    },
    subCategory: {
      type: String,
      default: "",
    },
    plan: {
      type: String,
      default: "Direct",
    },
    optionType: {
      type: String,
      default: "Growth",
    },
    folioNumber: {
      type: String,
      default: "",
      trim: true,
    },
    investmentType: {
      type: String,
      default: "SIP",
    },
    transactions: [mfTransactionSchema],
  },
  {
    timestamps: true,
  }
);

mutualFundSchema.index({ userId: 1, createdAt: -1 });

const MutualFund = InvestmentDB.model("MutualFund", mutualFundSchema);

console.log("---------------------------------------------------------------");
console.log(`✅ Pulse/${InvestmentDB.name}/MutualFund Connected`);
console.log("---------------------------------------------------------------");

export default MutualFund;
