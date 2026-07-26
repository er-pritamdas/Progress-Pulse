import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import HabitTracker from "../../models/Habit-models/habitTracker.model.js";
import HabitSettings from "../../models/Habit-models/habitSettings.model.js";
import PhysicalLog from "../../models/Habit-models/physicalLog.model.js";
import nodemailer from "nodemailer";
import XLSX from "xlsx";
import logger from "../../utils/Logging.js";

export const exportHabitDataToEmail = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userEmail = req.user.email;
  const username = req.user.username;

  if (!userEmail) {
    throw new ApiError(400, "No registered email address found for user");
  }

  logger.info(`Starting Habit Data Export for user '${username}' (${userEmail})`);

  // 1. Fetch Habit Tracker Table Entries
  const habitEntries = await HabitTracker.find({ userId }).sort({ date: 1 });

  // 2. Fetch Habit Settings
  const habitSettings = await HabitSettings.findOne({ userId });

  // 3. Fetch Physical Logs
  const physicalLogs = await PhysicalLog.find({ userId }).sort({ date: 1 });

  // --- Prepare Sheet 1: Table Entry ---
  const tableEntryRows = habitEntries.map((entry) => ({
    Date: entry.date || "",
    "Burned (kcal)": entry.habits?.burned ?? 0,
    "Water (L)": entry.habits?.water ?? 0,
    "Sleep (hrs)": entry.habits?.sleep ?? 0,
    "Read (hrs)": entry.habits?.read ?? 0,
    "Intake (kcal)": entry.habits?.intake ?? 0,
    SelfCare: entry.habits?.selfcare || "",
    Mood: entry.habits?.mood || "",
    Journal: entry.habits?.journal || "",
    "Progress (%)": entry.progress ?? 0,
    Status: entry.status || "",
    Score: entry.score ?? 0,
    Streak: entry.streak ?? 0,
  }));

  // --- Prepare Sheet 2: Settings ---
  const settingsData = habitSettings?.settings || {};
  const settingsRows = [
    { Category: "Burned Min Range", Value: settingsData.burned?.min ?? 0 },
    { Category: "Burned Max Range", Value: settingsData.burned?.max ?? 0 },
    { Category: "Water Min Range", Value: settingsData.water?.min ?? 0 },
    { Category: "Water Max Range", Value: settingsData.water?.max ?? 0 },
    { Category: "Sleep Min Range", Value: settingsData.sleep?.min ?? 0 },
    { Category: "Sleep Max Range", Value: settingsData.sleep?.max ?? 0 },
    { Category: "Read Min Range", Value: settingsData.read?.min ?? 0 },
    { Category: "Read Max Range", Value: settingsData.read?.max ?? 0 },
    { Category: "Intake Min Range", Value: settingsData.intake?.min ?? 0 },
    { Category: "Intake Max Range", Value: settingsData.intake?.max ?? 0 },
    { Category: "SelfCare Habits List", Value: (settingsData.selfcare || []).join(", ") },
    { Category: "Mood Options List", Value: (settingsData.mood || []).join(", ") },
    { Category: "Age", Value: habitSettings?.age ?? 21 },
    { Category: "Gender", Value: habitSettings?.gender || "male" },
    { Category: "Weight (kg)", Value: habitSettings?.weight ?? 70 },
    { Category: "Height (cm)", Value: habitSettings?.height ?? 170 },
    { Category: "Activity Level", Value: habitSettings?.activityLevel || "active" },
    { Category: "BMR (kcal)", Value: habitSettings?.bmr ?? 0 },
    { Category: "Maintenance Calories (kcal)", Value: habitSettings?.maintenanceCalories ?? 0 },
    { Category: "BMI", Value: habitSettings?.bmi ?? 0 },
    { Category: "Subscribe to Newsletter", Value: habitSettings?.subscribeToNewsletter ? "Yes" : "No" },
    { Category: "Email Notifications", Value: habitSettings?.emailNotification ? "Yes" : "No" },
    { Category: "Dark Mode", Value: habitSettings?.darkMode ? "Yes" : "No" },
    { Category: "Streak Reminders", Value: habitSettings?.streakReminders ? "Yes" : "No" },
  ];

  // --- Prepare Sheet 3: Logging ---
  const loggingRows = physicalLogs.map((log) => ({
    Date: log.date ? new Date(log.date).toISOString().split("T")[0] : "",
    "Weight (kg)": log.weight ?? "",
    "Height (cm)": log.height ?? "",
    BMI: log.bmi ?? "",
  }));

  // Build Excel Workbook
  const workbook = XLSX.utils.book_new();

  const sheet1 = XLSX.utils.json_to_sheet(
    tableEntryRows.length ? tableEntryRows : [{ Message: "No table entry data found" }]
  );
  XLSX.utils.book_append_sheet(workbook, sheet1, "Table Entry");

  const sheet2 = XLSX.utils.json_to_sheet(settingsRows);
  XLSX.utils.book_append_sheet(workbook, sheet2, "Settings");

  const sheet3 = XLSX.utils.json_to_sheet(
    loggingRows.length ? loggingRows : [{ Message: "No physical log data found" }]
  );
  XLSX.utils.book_append_sheet(workbook, sheet3, "Logging");

  const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  // Setup Nodemailer Transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const currentDate = new Date().toISOString().split("T")[0];
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "📊 Progress Pulse - Your Exported Habit Tracker Data",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #121212; color: #ffffff; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #1e1e1e; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
          <h2 style="color: #00DFA2; text-align: center;">Habit Data Export</h2>
          <p style="font-size: 16px; color: #cccccc;">Hi <strong>${username}</strong>,</p>
          <p style="font-size: 16px; color: #cccccc;">Your requested Habit Tracker export is attached below. The file contains 3 separate sheets:</p>
          <ul style="color: #00DFA2; line-height: 1.8; font-size: 15px;">
            <li><strong>Sheet 1: Table Entry</strong> - All your daily habit logs & tracking history.</li>
            <li><strong>Sheet 2: Settings</strong> - Your habit ranges, preferences & profile metrics.</li>
            <li><strong>Sheet 3: Logging</strong> - Your recorded physical measurements (weight, height, BMI).</li>
          </ul>
          <p style="font-size: 14px; color: #aaaaaa; margin-top: 20px;">If you didn't request this export, please secure your account.</p>
          <hr style="margin: 30px 0; border-color: #333;" />
          <p style="font-size: 12px; color: #555555; text-align: center;">
            &copy; ${new Date().getFullYear()} Progress Pulse. All rights reserved.
          </p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Habit_Tracker_Export_${currentDate}.xlsx`,
        content: excelBuffer,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Export email sent successfully to '${userEmail}'`);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, `Export sent successfully to ${userEmail}`));
  } catch (error) {
    logger.error(`Failed to send export email to '${userEmail}': ${error.message}`);
    throw new ApiError(500, `Failed to send export email: ${error.message}`);
  }
});
