import HabitTracker from "../../models/Habit-models/habitTracker.model.js";
import RegisteredUsers from "../../models/User-models/registeredUser.model.js";
import asynchandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const fetchHabitTableData = asynchandler(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "Username Required" });
  }

  const UserHabitEntries = await HabitTracker.findOne({ userId: user._id });

  if (!UserHabitEntries) {
    return res.status(404).json({ message: "User has no Habit Entries" });
  }

  return res.status(200).json({
    success: true,
    data: UserHabitEntries,
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
      day,
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

export { fetchHabitTableData, newHabitTableEntry };
