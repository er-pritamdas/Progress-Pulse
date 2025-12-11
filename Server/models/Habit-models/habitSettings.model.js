import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";
dotenv.config({
    path: "./.env",
});

const HabitDB = mongoose.connection.useDb(process.env.HABIT_DB);

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
        age: {
            type: Number,
            default: 21
        },
        gender: {
            type: String,
            enum: ["male", "female"],
            default: "male"
        },
        weight: {
            type: Number,
            default: 74
        },
        height: {
            type: Number,
            default: 174
        },
        activityLevel: {
            type: String,
            enum: ["light", "moderate", "active", "very_active"],
            default: "active"
        },
        maintenanceCalories: {
            type: Number,
            default: 2980
        },
        bmr: {
            type: Number,
            default: 1728
        },
        bmi: {
            type: Number,
            default: 24.4
        },
    },
    {
        timestamps: true,
    }
);

const HabitSettings = HabitDB.model("habitsettings", habitSettingsSchema);
const collectionName = HabitSettings.collection.collectionName;

console.log("---------------------------------------------------------------");
console.log(`✅ Pulse/${HabitDB.name}/${collectionName} Connected`);
console.log("---------------------------------------------------------------");

export default HabitSettings;
