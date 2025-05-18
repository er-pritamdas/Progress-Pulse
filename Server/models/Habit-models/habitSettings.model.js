import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";
dotenv.config({
    path: "./.env",
});

const HabitDB = mongoose.connection.useDb(process.env.HABIT_DB);
console.log(`✅ ${HabitDB.name} Connected`);

const rangeSchema = new mongoose.Schema(
    {
        min: { type: Number, required: true, default: 0 },
        max: { type: Number, required: true, default: 0 },
    },
    { _id: false }
);

const settingsSchema = new mongoose.Schema(
    {
        burned: { type: rangeSchema, required: true },
        water: { type: rangeSchema, required: true },
        sleep: { type: rangeSchema, required: true },
        read: { type: rangeSchema, required: true },
        intake: { type: rangeSchema, required: true },
        selfcare: { type: [String], required: true, default: ["Bath", "Brush", "Face"] },
        mood: { type: [String], required: true, default: ["Amazing", "Depressed", "Productive"] },
    },
    { _id: false }
);

const habitSettingsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: RegisteredUsers,
            required: true,
        },
        settings: {
            type: settingsSchema,
            required: true
        },
        subscribeToNewsletter: {
            type: Boolean,
            default: false
        },
        emailNotification: {
            type: Boolean,
            default: false
        },
        darkMode: {
            type: Boolean,
            default: false
        },
        streakReminders: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true,
    }
);

const HabitSettings = HabitDB.model("habitsettings", habitSettingsSchema);
export default HabitSettings;
