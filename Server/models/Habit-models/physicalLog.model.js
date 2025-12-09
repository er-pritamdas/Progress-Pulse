import mongoose from "mongoose";
import dotenv from "dotenv";
import RegisteredUsers from "../User-models/registeredUser.model.js";
dotenv.config({
    path: "./.env",
});

const HabitDB = mongoose.connection.useDb(process.env.HABIT_DB);

const physicalLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: RegisteredUsers,
            required: true,
        },
        weight: {
            type: Number,
            required: true,
        },
        height: {
            type: Number,
            required: true,
        },
        bmi: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const PhysicalLog = HabitDB.model("physicallog", physicalLogSchema);
const collectionName = PhysicalLog.collection.collectionName;

console.log("---------------------------------------------------------------");
console.log(`✅ Pulse/${HabitDB.name}/${collectionName} Connected`);
console.log("---------------------------------------------------------------");

export default PhysicalLog;
