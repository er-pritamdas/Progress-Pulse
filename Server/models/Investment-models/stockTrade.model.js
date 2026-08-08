import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";

dotenv.config({ path: "./.env" });

const InvestmentDB = mongoose.connection.useDb(
  process.env.INVESTMENT_DB || "Investment-Tracker"
);

const stockTradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: RegisteredUsers,
      required: true,
      index: true,
    },
    slNo: {
      type: Number,
      default: 1,
    },
    name: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    platform: {
      type: String,
      default: "Zerodha",
      trim: true,
    },
    cap: {
      type: String,
      enum: ["Large", "Mid", "Small"],
      default: "Large",
    },
    exchange: {
      type: String,
      enum: ["NSE", "BSE", "Other"],
      default: "NSE",
    },
    term: {
      type: String,
      enum: ["Delivery", "Intraday"],
      default: "Delivery",
    },
    // Buy Details
    bDate: {
      type: String,
      required: true,
    },
    bShare: {
      type: Number,
      required: true,
    },
    bQty: {
      type: Number,
      required: true,
    },
    bStock: {
      type: Number,
      required: true,
    },
    bBkg: {
      type: Number,
      default: 20,
    },
    bPdc: {
      type: Number,
      default: 0,
    },
    bBkgPdc: {
      type: Number,
      default: 20,
    },
    bFShare: {
      type: Number,
      required: true,
    },
    bFStock: {
      type: Number,
      required: true,
    },
    bTt: {
      type: Number,
      default: 0,
    },
    // Sell Details
    sDate: {
      type: String,
      default: "-",
    },
    sShare: {
      type: Number,
      default: 0,
    },
    sQty: {
      type: Number,
      default: 0,
    },
    sStock: {
      type: Number,
      default: 0,
    },
    sBkg: {
      type: Number,
      default: 0,
    },
    sPdc: {
      type: Number,
      default: 0,
    },
    dp: {
      type: Number,
      default: 0,
    },
    sBkgPdc: {
      type: Number,
      default: 0,
    },
    sFShare: {
      type: Number,
      default: 0,
    },
    sFStock: {
      type: Number,
      default: 0,
    },
    sTt: {
      type: Number,
      default: 0,
    },
    // Summary
    period: {
      type: Number,
      default: 0,
    },
    qLeft: {
      type: Number,
      default: 0,
    },
    gainRs: {
      type: Number,
      default: 0,
    },
    gainPct: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

stockTradeSchema.index({ userId: 1, createdAt: -1 });

const StockTrade = InvestmentDB.model("StockTrade", stockTradeSchema);

console.log("---------------------------------------------------------------");
console.log(`✅ Pulse/${InvestmentDB.name}/StockTrade Connected`);
console.log("---------------------------------------------------------------");

export default StockTrade;
