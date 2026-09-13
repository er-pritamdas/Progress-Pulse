import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import HabitTracker from "../../models/Habit-models/habitTracker.model.js";
import nodemailer from "nodemailer";
import XLSX from "xlsx";
import logger from "../../utils/Logging.js";

export const exportJournalDataToEmail = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userEmail = req.user.email;
  const username = req.user.username;
  const { startDate, endDate } = req.body || {};

  if (!userEmail) {
    throw new ApiError(400, "No registered email address found for user");
  }

  logger.info(`Starting Journal Data Export for user '${username}' (${userEmail}) [${startDate || "All"} to ${endDate || "All"}]`);

  // Query HabitTracker entries within date range
  const query = { userId };
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    query.date = { $gte: startDate };
  } else if (endDate) {
    query.date = { $lte: endDate };
  }

  const entries = await HabitTracker.find(query).sort({ date: 1 });

  // Filter or map entries that have journal or mood
  const journalEntries = entries.filter(
    (e) => (e.habits?.journal && e.habits.journal.trim().length > 0) || (e.habits?.mood && e.habits.mood.toString().trim().length > 0 && e.habits.mood !== "0")
  );

  // If no filtered entries, include all entries so user still gets their journal sheet
  const targetEntries = journalEntries.length > 0 ? journalEntries : entries;

  let totalWords = 0;
  const moodCounts = {};
  let daysWithJournalNotes = 0;

  const journalRows = targetEntries.map((entry) => {
    const journalText = (entry.habits?.journal || "").trim();
    const mood = entry.habits?.mood && entry.habits.mood !== "0" ? entry.habits.mood : "Unspecified";
    const words = journalText ? journalText.split(/\s+/).filter(Boolean).length : 0;
    const chars = journalText.length;

    if (journalText.length > 0) {
      daysWithJournalNotes += 1;
      totalWords += words;
    }

    if (mood && mood !== "Unspecified") {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    }

    return {
      Date: entry.date || "",
      Day: entry.day || "",
      Mood: mood,
      "Word Count": words,
      "Char Count": chars,
      "Journal Entry / Reflection": journalText || "(No note recorded)",
      "Habit Completion (%)": entry.completionRate ?? entry.progress ?? 0,
      Score: entry.score ?? 0,
      Streak: entry.streak ?? 0,
      Status: entry.status || "inconsistent",
    };
  });

  // Calculate top mood
  let topMood = "N/A";
  let maxMoodCount = 0;
  for (const [m, count] of Object.entries(moodCounts)) {
    if (count > maxMoodCount) {
      maxMoodCount = count;
      topMood = m;
    }
  }

  const avgWords = daysWithJournalNotes > 0 ? Math.round(totalWords / daysWithJournalNotes) : 0;

  // Sheet 2: Summary & Mood Statistics
  const summaryOverviewRows = [
    { Metric: "Total Days in Selected Period", Value: entries.length },
    { Metric: "Days with Journal Notes", Value: daysWithJournalNotes },
    { Metric: "Journal Note Frequency (%)", Value: entries.length ? `${Math.round((daysWithJournalNotes / entries.length) * 100)}%` : "0%" },
    { Metric: "Total Words Written", Value: totalWords },
    { Metric: "Average Words per Entry", Value: avgWords },
    { Metric: "Primary Mood", Value: topMood },
    { Metric: "Total Mood Logs Recorded", Value: Object.values(moodCounts).reduce((a, b) => a + b, 0) },
  ];

  const moodBreakdownRows = Object.keys(moodCounts).length > 0
    ? Object.entries(moodCounts).map(([moodName, count]) => ({
        Mood: moodName,
        "Entries Count": count,
        "Share (%)": `${Math.round((count / (Object.values(moodCounts).reduce((a, b) => a + b, 0) || 1)) * 100)}%`,
      }))
    : [{ Mood: "No mood records found in date range", "Entries Count": 0, "Share (%)": "0%" }];

  // Build Excel Workbook
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Journal Entries
  const sheet1 = XLSX.utils.json_to_sheet(
    journalRows.length ? journalRows : [{ Message: "No journal or habit entries found for selected date range" }]
  );
  sheet1["!cols"] = [
    { wch: 13 }, // Date
    { wch: 12 }, // Day
    { wch: 15 }, // Mood
    { wch: 12 }, // Word Count
    { wch: 12 }, // Char Count
    { wch: 60 }, // Journal Entry
    { wch: 20 }, // Habit Completion
    { wch: 8 },  // Score
    { wch: 8 },  // Streak
    { wch: 14 }, // Status
  ];
  XLSX.utils.book_append_sheet(workbook, sheet1, "Journal Entries");

  // Sheet 2: Mood & Reflection Summary
  const sheet2 = XLSX.utils.json_to_sheet(summaryOverviewRows);
  sheet2["!cols"] = [{ wch: 32 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(workbook, sheet2, "Journal Summary");

  // Sheet 3: Mood Breakdown
  const sheet3 = XLSX.utils.json_to_sheet(moodBreakdownRows);
  sheet3["!cols"] = [{ wch: 20 }, { wch: 16 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(workbook, sheet3, "Mood Analytics");

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
  const rangeTitle = startDate && endDate ? `(${startDate} to ${endDate})` : "";
  const dateRangeStr = startDate && endDate ? `${startDate}_to_${endDate}` : currentDate;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `📖 Progress Pulse - Personal Journal & Mood Export ${rangeTitle}`.trim(),
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #121212; color: #ffffff; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #1e1e1e; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
          <h2 style="color: #f43f5e; text-align: center;">Personal Journal & Reflection Export</h2>
          <p style="font-size: 16px; color: #cccccc;">Hi <strong>${username}</strong>,</p>
          <p style="font-size: 16px; color: #cccccc;">Your requested Personal Journal & Mood records ${rangeTitle} are compiled and attached below. The file contains 3 detailed worksheets:</p>
          <ul style="color: #f43f5e; line-height: 1.8; font-size: 15px;">
            <li><strong>Sheet 1: Journal Entries</strong> - Day-by-day notes, reflections, moods, word counts, and habit scores.</li>
            <li><strong>Sheet 2: Journal Summary</strong> - Total words written, reflection frequency, and average entry length.</li>
            <li><strong>Sheet 3: Mood Analytics</strong> - Complete mood distribution and emotional trends over time.</li>
          </ul>
          <p style="font-size: 14px; color: #aaaaaa; margin-top: 20px;">If you didn't request this export, please secure your account immediately.</p>
          <hr style="margin: 30px 0; border-color: #333;" />
          <p style="font-size: 12px; color: #555555; text-align: center;">
            &copy; ${new Date().getFullYear()} Progress Pulse. All rights reserved.
          </p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Personal_Journal_Export_${dateRangeStr}.xlsx`,
        content: excelBuffer,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Journal export email sent successfully to '${userEmail}'`);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, `Journal export sent successfully to ${userEmail}`));
  } catch (error) {
    logger.error(`Failed to send journal export email to '${userEmail}': ${error.message}`);
    throw new ApiError(500, `Failed to send journal export email: ${error.message}`);
  }
});
