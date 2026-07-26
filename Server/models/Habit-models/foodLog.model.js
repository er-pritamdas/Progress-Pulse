import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";
import FoodDatabase from "./foodDatabase.model.js";

dotenv.config({
  path: "./.env",
});

const HabitDB = mongoose.connection.useDb(process.env.HABIT_DB || "Habit");

const foodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: RegisteredUsers,
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    }, // Format: YYYY-MM-DD
    mealType: {
      type: String,
      required: true,
      enum: ["Breakfast", "Lunch", "Dinner", "Snacks", "Other"],
      default: "Breakfast",
    },
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: FoodDatabase,
      required: true,
    },
    foodName: {
      type: String,
      required: true,
    },
    servings: {
      type: Number,
      required: true,
      default: 1,
      min: 0.1,
    },
    unitType: {
      type: String,
      default: "100 g",
    },
    servingSize: {
      type: Number,
      default: 100,
    },
    calories: {
      type: Number,
      required: true,
      default: 0,
    },
    protein: {
      type: Number,
      default: 0,
    },
    carbohydrates: {
      type: Number,
      default: 0,
    },
    fat: {
      type: Number,
      default: 0,
    },
    fiber: {
      type: Number,
      default: 0,
    },
    sugar: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

foodLogSchema.index({ userId: 1, date: 1 });

const FoodLog = HabitDB.model("foodlog", foodLogSchema);

export default FoodLog;
