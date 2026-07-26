import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";

dotenv.config({
  path: "./.env",
});

const HabitDB = mongoose.connection.useDb(process.env.HABIT_DB || "Habit");

const foodDatabaseSchema = new mongoose.Schema(
  {
    foodId: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      default: "Generic",
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
      index: true,
    },
    subCategory: {
      type: String,
      default: "",
      trim: true,
    },
    unitType: {
      type: String,
      default: "100 g",
      trim: true,
    },
    servingSize: {
      type: Number,
      default: 100,
    },
    source: {
      type: String,
      default: "User Defined",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    // Macronutrients
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
    netCarbs: {
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
    addedSugar: {
      type: Number,
      default: 0,
    },

    // Vitamins
    vitaminA: { type: String, default: "0" },
    vitaminB1: { type: String, default: "0" },
    vitaminB2: { type: String, default: "0" },
    vitaminB3: { type: String, default: "0" },
    vitaminB5: { type: String, default: "0" },
    vitaminB6: { type: String, default: "0" },
    vitaminB7: { type: String, default: "0" },
    vitaminB9: { type: String, default: "0" },
    vitaminB12: { type: String, default: "0" },
    vitaminC: { type: String, default: "0" },
    vitaminD: { type: String, default: "0" },
    vitaminE: { type: String, default: "0" },
    vitaminK: { type: String, default: "0" },

    // Trace Minerals
    iron: { type: String, default: "0" },
    zinc: { type: String, default: "0" },
    copper: { type: String, default: "0" },
    manganese: { type: String, default: "0" },
    selenium: { type: String, default: "0" },
    iodine: { type: String, default: "0" },

    // Fatty Acids
    saturatedFat: { type: String, default: "0" },
    monounsaturatedFat: { type: String, default: "0" },
    polyunsaturatedFat: { type: String, default: "0" },
    omega3: { type: String, default: "0" },
    omega6: { type: String, default: "0" },
    transFat: { type: String, default: "0" },

    // Others
    cholesterol: { type: String, default: "0" },
    glycemicIndex: { type: String, default: "N/A" },
    glycemicLoad: { type: String, default: "N/A" },
    water: { type: String, default: "0" },

    // Ownership & Custom Flag
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: RegisteredUsers,
      default: null,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

foodDatabaseSchema.index({ name: "text", category: "text", brand: "text" });

const FoodDatabase = HabitDB.model("fooddatabase", foodDatabaseSchema);

export default FoodDatabase;
