import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model";
dotenv.config({
  path: "./.env",
});

const HabitDB = mongoose.connection.useDb(process.env.HABIT_DB);
console.log(`✅ ${HabitDB.name} Connected`);

const dailyHabitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: RegisteredUsers,
      required: true,
    },

    day:{
      type: Number,
      required: true,
    },

    date: { 
        type: String, 
        required: true 
    }, // Format: YYYY-MM-DD

    habits: {
      burned: {
        type: Number,
      },
      water: {
        type: Number,
      },
      sleep: {
        type: Number,
      },
      read: {
        type: Number,
      },
      intake: {
        type: Number,
      },
      selfcare: {
        type: String,
      },
      mood: {
        type: String,
      },
    },

    progress:{
      type: Number,
      required: true,
      min:0,
      max:100,
      default:0,
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

const HabitTracker = HabitDB.model("habittracker", dailyHabitSchema);

export default HabitTracker;
