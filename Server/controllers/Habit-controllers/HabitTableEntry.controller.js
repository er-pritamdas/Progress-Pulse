import HabitTracker from "../../models/Habit-models/habitTracker.model.js";
import RegisteredUsers from "../../models/User-models/registeredUser.model.js";
import asynchandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const fetchHabitTableData = asynchandler(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401,"Username Required")
  }

  // Get pagination params from query
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 7;
  const skip = (page - 1) * limit;

  // Count total entries for this user
  const totalEntries = await HabitTracker.countDocuments({ userId: user._id });

  // Fetch paginated entries
  const entries = await HabitTracker.find({ userId: user._id })
    .sort({ date: -1 }) // latest first
    .skip(skip)
    .limit(limit);

  if (!entries || entries.length === 0) {
    return res.status(404).json({ message: "No habit entries found" });
  }

  // Format data similar to the mock data format with fallback to "" for undefined values
  const formattedEntries = entries.map((entry) => ({
    date: entry.date ? entry.date.toString() : "",
    burned: entry.habits.burned ? entry.habits.burned.toString() : "",
    water: entry.habits.water ? entry.habits.water.toString() : "",
    sleep: entry.habits.sleep ? entry.habits.sleep.toString() : "",
    read: entry.habits.read ? entry.habits.read.toString() : "",
    intake: entry.habits.intake ? entry.habits.intake.toString() : "",
    selfcare: entry.habits.selfcare ? entry.habits.selfcare.toString() : "",
    mood: entry.habits.mood ? entry.habits.mood.toString() : "",
    progress: entry.progress ? entry.progress.toString() : "",
  }));

  return res.status(200).json({
    success: true,
    page,
    limit,
    totalEntries,
    totalPages: Math.ceil(totalEntries / limit),
    data: formattedEntries,
  });
});


const newHabitTableEntry = asynchandler(async (req, res, next) => {
  const {
    date,
    burned,
    water,
    sleep,
    read,
    intake,
    selfcare,
    mood,
    progress,
  } = req.body;

  const user = req.user;

  if (!user || !user._id) {
    return res.status(401).json({ message: "Unauthorized: user not found." });
  }

  try {
    const newHabit = await HabitTracker.create({
      userId: user._id,
      date,
      habits: {
        burned,
        water,
        sleep,
        read,
        intake,
        selfcare,
        mood,
      },
      progress,
      // score, completionRate, streak will take default values
    });

    res.status(201).json({
      message: "Habit entry created successfully!",
      data: newHabit,
    });
  } catch (err) {
    if (err.code === 11000) {
      // duplicate entry error due to unique index on userId + date
      return res.status(400).json({
        message: "You've already submitted a habit log for this date.",
      });
    }

    console.error("Error creating habit entry:", err.message);
    res.status(500).json({
      message: "Something went wrong while creating habit entry.",
      error: err.message,
    });
  }
});


const deleteHabitTableEntry = asynchandler(
  async(req, res, next) =>{

  }
);

const editHabitTableEntry = asynchandler(
  async(req, res, next) =>{

  }
);

export { fetchHabitTableData, newHabitTableEntry, deleteHabitTableEntry,  editHabitTableEntry};
