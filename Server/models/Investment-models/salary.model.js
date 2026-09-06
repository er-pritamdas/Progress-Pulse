import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";

dotenv.config({ path: "./.env" });

const InvestmentDB = mongoose.connection.useDb(
  process.env.INVESTMENT_DB || "Investment-Tracker"
);

const salarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: RegisteredUsers,
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    basicSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    hra: {
      type: Number,
      default: 0,
    },
    flexi: {
      type: Number,
      default: 0, // Flexi / RSA / Extras
    },
    bonus: {
      type: Number,
      default: 0, // Bonus
    },
    gross: {
      type: Number,
      default: 0, // Gross(+E6e PF) = basicSalary + hra + flexi + bonus
    },
    erPf: {
      type: Number,
      default: 0, // E6r PF
    },
    taxes: {
      type: Number,
      default: 0, // Tax + State Tax + Special Allowance
    },
    inHand: {
      type: Number,
      default: 0, // In Hand = gross - (erPf + taxes)
    },
    gratuity: {
      type: Number,
      default: 0,
    },
    variablePay: {
      type: Number,
      default: 0,
    },
    ctc: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

salarySchema.pre("save", function (next) {
  const basic = Number(this.basicSalary) || 0;
  const hra = Number(this.hra) || 0;
  const flexi = Number(this.flexi) || 0;
  const bonus = Number(this.bonus) || 0;
  const erPf = Number(this.erPf) || 0;
  const taxes = Number(this.taxes) || 0;
  const gratuity = Number(this.gratuity) || 0;
  const variablePay = Number(this.variablePay) || 0;

  this.gross = basic + hra + flexi + bonus;
  this.inHand = this.gross - (erPf + taxes);
  if (!this.ctc) {
    this.ctc = this.gross + erPf + gratuity + variablePay;
  }
  next();
});

salarySchema.index({ userId: 1, month: -1 });

const Salary = InvestmentDB.model("Salary", salarySchema);

console.log(`✅ Pulse/${InvestmentDB.name}/Salary Connected`);

export default Salary;
