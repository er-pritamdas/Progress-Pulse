import HabitTracker from "../../models/Habit-models/habitTracker.model.js";
import RegisteredUsers from "../../models/User-models/registeredUser.model.js";
import asynchandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const readHabitTableData = asynchandler(async (req, res, next) => {
  const user = req.user;
  if (!user) throw new ApiError(401, "Username Required");

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 7;
  const skip = (page - 1) * limit;

  // Parse optional date filters
  const startDate = req.query.startDate ?? null;
  const endDate = req.query.endDate ?? null;

  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.date = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    dateFilter.date = { $gte: startDate };
  } else if (endDate) {
    dateFilter.date = { $lte: endDate };
  }

  const filter = {
    userId: user._id,
    ...dateFilter
  };

  const totalEntries = await HabitTracker.countDocuments(filter);
  console.log(filter)
  const entries = await HabitTracker.find(filter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  if (!entries.length) {
    throw new ApiError(404, "No Habit Entries Found");
  }

  const formattedEntries = entries.map((entry) => ({
    date: entry.date ? entry.date.toString() : "",
    burned: entry.habits.burned?.toString() || "",
    water: entry.habits.water?.toString() || "",
    sleep: entry.habits.sleep?.toString() || "",
    read: entry.habits.read?.toString() || "",
    intake: entry.habits.intake?.toString() || "",
    selfcare: entry.habits.selfcare?.toString() || "",
    mood: entry.habits.mood?.toString() || "",
    progress: entry.progress?.toString() || "",
    score: entry.score?.toString() || "",
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        page,
        limit,
        totalEntries,
        totalPages: Math.ceil(totalEntries / limit),
        formattedEntries,
      },
      "Habit entries fetched successfully"
    )
  );
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
    score
  } = req.body;

  const user = req.user;

  if (!user || !user._id) {
    throw new ApiError(401, "Unauthorized: User Not Found")
  }

  const getStatusFromProgress = (progress) => {
    if (progress < 25) return "inconsistent";
    if (progress < 50) return "uncertain";
    if (progress < 75) return "moderate";
    return "consistent";
  };

  const status = getStatusFromProgress(progress);

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
      status,
      score
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
    score,
  } = req.body;

  if (!date) {
    throw new ApiError(400, "Date query parameter is required");
  }
  const getStatusFromProgress = (progress) => {
    if (progress < 25) return "inconsistent";
    if (progress < 50) return "uncertain";
    if (progress < 75) return "moderate"; // short form for "partially consistent"
    return "consistent";
  };

  const status = getStatusFromProgress(progress);
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
        status: status,
        score: score,
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
