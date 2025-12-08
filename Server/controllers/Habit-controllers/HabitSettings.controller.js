// controllers/habitSettings.controller.js
import HabitSettings from "../../models/Habit-models/habitSettings.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import asynchandler from "../../utils/asyncHandler.js";
import { defaultHabitSettings } from "../../utils/defaultHabitSettings.js";

// @GET: Get Habit Settings for logged-in user
const getHabitSettings = asynchandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  let Settings = await HabitSettings.findOne({ userId: user._id });

  if (!Settings) {
    // Auto-create default if not present
    Settings = await HabitSettings.create({
      userId: user._id,
      ...defaultHabitSettings,
    });
  }
  console.log(Settings)
  const Data = {
    settings: Settings.settings,
    subscribeToNewsletter: Settings.subscribeToNewsletter,
    emailNotification: Settings.emailNotification,
    darkMode: Settings.darkMode,
    streakReminders: Settings.streakReminders,
    age: Settings.age,
    gender: Settings.gender,
    weight: Settings.weight,
    height: Settings.height,
    activityLevel: Settings.activityLevel,
    maintenanceCalories: Settings.maintenanceCalories,
  }
  return res.status(200).json(
    new ApiResponse(200, Data, "Habit settings fetched successfully")
  );
});

// @PUT: Update Habit Settings for logged-in user
const updateHabitSettings = asynchandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  const updates = req.body;

  const Settings = await HabitSettings.findOneAndUpdate(
    { userId: user._id },
    { $set: updates },
    { new: true } // upsert: true create if doesn't exist
  );
  const Data = {
    settings: Settings.settings,
    subscribeToNewsletter: Settings.subscribeToNewsletter,
    emailNotification: Settings.emailNotification,
    darkMode: Settings.darkMode,
    streakReminders: Settings.streakReminders,
    age: Settings.age,
    gender: Settings.gender,
    weight: Settings.weight,
    height: Settings.height,
    activityLevel: Settings.activityLevel,
    maintenanceCalories: Settings.maintenanceCalories,
  }
  return res.status(200).json(
    new ApiResponse(200, Data, "Habit settings updated successfully")
  );
});

// @DELETE: Reset Habit Settings to default
const resetHabitSettingsToDefault = asynchandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  const Settings = await HabitSettings.findOneAndUpdate(
    { userId: user._id },
    { $set: defaultHabitSettings },
    { new: true, upsert: true }
  );
  const Data = {
    settings: Settings.settings,
    subscribeToNewsletter: Settings.subscribeToNewsletter,
    emailNotification: Settings.emailNotification,
    darkMode: Settings.darkMode,
    streakReminders: Settings.streakReminders,
    age: Settings.age,
    gender: Settings.gender,
    weight: Settings.weight,
    height: Settings.height,
    activityLevel: Settings.activityLevel,
    maintenanceCalories: Settings.maintenanceCalories,
  }
  return res.status(200).json(
    new ApiResponse(200, Data, "Habit settings reset to default")
  );
});

export {
  getHabitSettings,
  updateHabitSettings,
  resetHabitSettingsToDefault,
};
