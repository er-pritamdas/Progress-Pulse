import HabitTracker from "../../models/Habit-models/habitTracker.model.js";
import RegisteredUsers from "../../models/User-models/registeredUser.model.js";
import asynchandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const readHabitTableData = asynchandler(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Username Required")
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
    throw new ApiError(404, "No Habit Entries Found")
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

  return res.status(201).json(
    new ApiResponse(201, {page, limit, totalEntries, totalPages:Math.ceil(totalEntries / limit), formattedEntries }, "User Registered successfully")
)
});

const createHabitTableEntry = asynchandler(async (req, res, next) => {
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
    throw new ApiError(401, "Unauthorized: User Not Found")
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

    return res.status(201).json(
      new ApiResponse(201, newHabit, "Habit Logged Successfully")
    )
    // res.status(201).json({
    //   message: "Habit entry created successfully!",
    //   data: newHabit,
    // });
  } catch (err) {
    if (err.code === 11000) {
      // duplicate entry error due to unique index on userId + date
      throw new ApiError(400, "You've already submitted a habit log for this date.")
    }
    throw new ApiError(500, "Something went wrong while creating habit entry.", [err.message])
  }
});

const deleteHabitTableEntry = asynchandler(async (req, res, next) => {
    const date = req.query.date; // Expecting format: "YYYY-MM-DD"
    const userId = req.user._id;

    if (!date) {
      throw new ApiError(400, "Date query parameter is required")
    }

    const deletedDoc = await HabitTracker.findOneAndDelete({
      userId: userId,
      date: date,
    });

    if (!deletedDoc) {
      throw new ApiError(404, "Habit entry not found for this date")
    }
    return res.status(200).json(
      new ApiResponse(200, `Habit entry for ${date} deleted successfully`)
    )

});

const updateHabitTableEntry = asynchandler(async (req, res, next) => {
  const userId = req.user._id;

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

  if (!date) {
    throw new ApiError(400, "Date query parameter is required");
  }

  const updatedDoc = await HabitTracker.findOneAndUpdate(
    { userId, date },
    {
      $set: {
        "habits.burned": burned,
        "habits.water": water,
        "habits.sleep": sleep,
        "habits.read": read,
        "habits.intake": intake,
        "habits.selfcare": selfcare,
        "habits.mood": mood,
        progress: progress,
      },
    },
    { new: true } // return the updated document
  );

  if (!updatedDoc) {
    throw new ApiError(404, "Habit entry not found for this date");
  }

  return res.status(200).json(
    new ApiResponse(200, updatedDoc, `Habit entry for ${date} updated successfully`)
  );
});

export { readHabitTableData, createHabitTableEntry, deleteHabitTableEntry, updateHabitTableEntry };
