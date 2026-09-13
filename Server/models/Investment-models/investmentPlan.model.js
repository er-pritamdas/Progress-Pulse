import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";

dotenv.config({ path: "./.env" });

const InvestmentDB = mongoose.connection.useDb(
  process.env.INVESTMENT_DB || "Investment-Tracker"
);

const investmentPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: RegisteredUsers,
      required: true,
      index: true,
    },
    customId: {
      type: String,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "🎯",
      trim: true,
    },
    category: {
      type: String,
      default: "custom",
      trim: true,
    },
    targetAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetDate: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    allocations: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    selectedBanks: {
      type: [String],
      default: [],
    },
    allocatedBanks: {
      type: [String],
      default: [],
    },
    selectedStocks: {
      type: [String],
      default: [],
    },
    allocatedStocks: {
      type: [String],
      default: [],
    },
    selectedMfs: {
      type: [String],
      default: [],
    },
    allocatedMfs: {
      type: [String],
      default: [],
    },
    selectedFds: {
      type: [String],
      default: [],
    },
    allocatedFds: {
      type: [String],
      default: [],
    },
    selectedRds: {
      type: [String],
      default: [],
    },
    allocatedRds: {
      type: [String],
      default: [],
    },
    includePf: {
      type: Boolean,
      default: false,
    },
    pfAllocatedPercent: {
      type: Number,
      default: 0,
    },
    pfAllocation: {
      enabled: {
        type: Boolean,
        default: false,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

investmentPlanSchema.index({ userId: 1, createdAt: -1 });
investmentPlanSchema.index({ userId: 1, customId: 1 });

const InvestmentPlan = InvestmentDB.model("InvestmentPlan", investmentPlanSchema);

console.log("---------------------------------------------------------------");
console.log(`✅ Pulse/${InvestmentDB.name}/InvestmentPlan Connected`);
console.log("---------------------------------------------------------------");

export default InvestmentPlan;
