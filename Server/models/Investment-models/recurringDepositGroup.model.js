import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";

dotenv.config({ path: "./.env" });

const InvestmentDB = mongoose.connection.useDb(
  process.env.INVESTMENT_DB || "Investment-Tracker"
);

const singleGroupSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rdIds: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const rdGroupSettingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: RegisteredUsers,
      required: true,
      unique: true,
      index: true,
    },
    groups: {
      type: [singleGroupSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const RecurringDepositGroup = InvestmentDB.model("RecurringDepositGroup", rdGroupSettingSchema);

console.log("---------------------------------------------------------------");
console.log(`✅ Pulse/${InvestmentDB.name}/RecurringDepositGroup Connected`);
console.log("---------------------------------------------------------------");

export default RecurringDepositGroup;
