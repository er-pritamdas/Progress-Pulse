import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";
dotenv.config({
  path: "./.env",
});

const HabitDB = mongoose.connection.useDb(process.env.HABIT_DB);


const dailyHabitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: RegisteredUsers,
      required: true,
    },

    date: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    }, // Format: YYYY-MM-DD

    habits: {
      burned: {
        type: Number,
        default: 0,
        min: 0,
        max: 10000,
        trim: true,
      },
      water: {
        type: Number,
        default: 0,
        min: 0,
        max: 10000,
        trim: true,
      },
      sleep: {
        type: Number,
        default: 0,
        min: 0,
        max: 10000,
        trim: true,
      },
      read: {
        type: Number,
        default: 0,
        min: 0,
        max: 10000,
        trim: true,
      },
      intake: {
        type: Number,
        default: 0,
        min: 0,
        max: 10000,
        trim: true,
      },
      selfcare: {
        type: String,
        default: 0,
        min: 0,
        max: 10000,
        trim: true,
      },
      mood: {
        type: String,
        default: 0,
        min: 0,
        max: 10000,
        trim: true,
      },
    },

    progress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
      trim: true,
    },

    status: {
      type: String,
      enum: ["inconsistent", "uncertain", "partiallyconsistent", "consistent"],
      default: "inconsistent",
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 7,
    },

    completionRate: {
      type: Number,
      default: 0,
    },

    streak: {
      type: Number,
      default: 0,
    }

  },
  {
    timestamps: true,
  }
);

dailyHabitSchema.index({ userId: 1, date: 1 }, { unique: true });

const HabitTracker = HabitDB.model("habittracker", dailyHabitSchema);
const collectionName = HabitTracker.collection.collectionName;

console.log("---------------------------------------------------------------");
console.log(`✅ Pulse/${HabitDB.name}/${collectionName} Connected`);
console.log("---------------------------------------------------------------");

export default HabitTracker;
