import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import FoodLog from "../../models/Habit-models/foodLog.model.js";
import HabitSettings from "../../models/Habit-models/habitSettings.model.js";
import nodemailer from "nodemailer";
import XLSX from "xlsx";
import logger from "../../utils/Logging.js";

const VITAMINS = [
  { key: "vitaminA", label: "Vitamin A", unit: "mcg" },
  { key: "vitaminB1", label: "Vitamin B1 (Thiamine)", unit: "mg" },
  { key: "vitaminB2", label: "Vitamin B2 (Riboflavin)", unit: "mg" },
  { key: "vitaminB3", label: "Vitamin B3 (Niacin)", unit: "mg" },
  { key: "vitaminB5", label: "Vitamin B5 (Pantothenic Acid)", unit: "mg" },
  { key: "vitaminB6", label: "Vitamin B6", unit: "mg" },
  { key: "vitaminB7", label: "Vitamin B7 (Biotin)", unit: "mcg" },
  { key: "vitaminB9", label: "Vitamin B9 (Folate)", unit: "mcg" },
  { key: "vitaminB12", label: "Vitamin B12", unit: "mcg" },
  { key: "vitaminC", label: "Vitamin C", unit: "mg" },
  { key: "vitaminD", label: "Vitamin D", unit: "IU" },
  { key: "vitaminE", label: "Vitamin E", unit: "mg" },
  { key: "vitaminK", label: "Vitamin K", unit: "mcg" },
];

const MINERALS = [
  { key: "calcium", label: "Calcium", unit: "mg" },
  { key: "iron", label: "Iron", unit: "mg" },
  { key: "magnesium", label: "Magnesium", unit: "mg" },
  { key: "phosphorus", label: "Phosphorus", unit: "mg" },
  { key: "potassium", label: "Potassium", unit: "mg" },
  { key: "sodium", label: "Sodium", unit: "mg" },
  { key: "zinc", label: "Zinc", unit: "mg" },
  { key: "copper", label: "Copper", unit: "mg" },
  { key: "manganese", label: "Manganese", unit: "mg" },
  { key: "selenium", label: "Selenium", unit: "mcg" },
  { key: "iodine", label: "Iodine", unit: "mcg" },
];

const FATTY_ACIDS_OTHER = [
  { key: "saturatedFat", label: "Saturated Fat", unit: "g" },
  { key: "monounsaturatedFat", label: "Monounsaturated Fat", unit: "g" },
  { key: "polyunsaturatedFat", label: "Polyunsaturated Fat", unit: "g" },
  { key: "transFat", label: "Trans Fat", unit: "g" },
  { key: "omega3", label: "Omega-3 Fatty Acids", unit: "g" },
  { key: "omega6", label: "Omega-6 Fatty Acids", unit: "g" },
  { key: "cholesterol", label: "Cholesterol", unit: "mg" },
  { key: "water", label: "Water", unit: "g" },
  { key: "glycemicLoad", label: "Glycemic Load", unit: "" },
];

const getPrescribedTargets = (userSettings) => {
  const age = userSettings?.age || 21;
  const gender = userSettings?.gender || "male";
  const isMale = gender === "male";
  const maintenanceCalories = userSettings?.maintenanceCalories || 2000;

  const settingsIntake = userSettings?.settings?.intake;
  const calorieMin = settingsIntake?.min || (maintenanceCalories ? Math.round(maintenanceCalories * 0.9) : 1500);
  const calorieMax = settingsIntake?.max || (maintenanceCalories ? Math.round(maintenanceCalories * 1.1) : 2500);

  const proteinMin = Math.round((calorieMin * 0.3) / 4);
  const proteinMax = Math.round((calorieMax * 0.3) / 4);
  const carbsMin = Math.round((calorieMin * 0.4) / 4);
  const carbsMax = Math.round((calorieMax * 0.4) / 4);
  const fatMin = Math.round((calorieMin * 0.3) / 9);
  const fatMax = Math.round((calorieMax * 0.3) / 9);

  return {
    calories: { min: calorieMin, max: calorieMax, target: Math.round((calorieMin + calorieMax) / 2) },
    protein: { min: proteinMin, max: proteinMax, target: Math.round((proteinMin + proteinMax) / 2) },
    carbohydrates: { min: carbsMin, max: carbsMax, target: Math.round((carbsMin + carbsMax) / 2) },
    netCarbs: { min: carbsMin, max: carbsMax, target: Math.round((carbsMin + carbsMax) / 2) },
    fat: { min: fatMin, max: fatMax, target: Math.round((fatMin + fatMax) / 2) },
    fiber: { min: isMale ? 38 : 25, max: "-", target: isMale ? 38 : 25 },
    sugar: { min: "-", max: isMale ? 36 : 25, target: isMale ? 36 : 25 },
    addedSugar: { min: "-", max: isMale ? 36 : 25, target: isMale ? 36 : 25 },
    saturatedFat: { min: "-", max: 20, target: 16 },
    monounsaturatedFat: { min: "-", max: 25, target: 20 },
    polyunsaturatedFat: { min: "-", max: 20, target: 15 },
    transFat: { min: "-", max: 0, target: 0 },
    omega3: { min: isMale ? 1.6 : 1.1, max: "-", target: isMale ? 1.6 : 1.1 },
    omega6: { min: isMale ? 17 : 12, max: "-", target: isMale ? 17 : 12 },
    cholesterol: { min: "-", max: 300, target: 200 },
    vitaminA: { min: isMale ? 900 : 700, max: "-", target: isMale ? 900 : 700 },
    vitaminB1: { min: isMale ? 1.2 : 1.1, max: "-", target: isMale ? 1.2 : 1.1 },
    vitaminB2: { min: isMale ? 1.3 : 1.1, max: "-", target: isMale ? 1.3 : 1.1 },
    vitaminB3: { min: isMale ? 16 : 14, max: "-", target: isMale ? 16 : 14 },
    vitaminB5: { min: 5, max: "-", target: 5 },
    vitaminB6: { min: age > 50 ? (isMale ? 1.7 : 1.5) : 1.3, max: "-", target: 1.5 },
    vitaminB7: { min: 30, max: "-", target: 30 },
    vitaminB9: { min: 400, max: "-", target: 400 },
    vitaminB12: { min: 2.4, max: "-", target: 2.4 },
    vitaminC: { min: isMale ? 90 : 75, max: "-", target: isMale ? 90 : 75 },
    vitaminD: { min: 600, max: "-", target: 600 },
    vitaminE: { min: 15, max: "-", target: 15 },
    vitaminK: { min: isMale ? 120 : 90, max: "-", target: isMale ? 120 : 90 },
    calcium: { min: 1000, max: 2500, target: 1000 },
    iron: { min: isMale ? 8 : (age > 50 ? 8 : 18), max: "-", target: isMale ? 8 : 18 },
    magnesium: { min: isMale ? 400 : 310, max: "-", target: isMale ? 400 : 310 },
    phosphorus: { min: 700, max: "-", target: 700 },
    potassium: { min: 3400, max: "-", target: 3400 },
    sodium: { min: 1500, max: 2300, target: 2000 },
    zinc: { min: isMale ? 11 : 8, max: "-", target: isMale ? 11 : 8 },
    copper: { min: 0.9, max: "-", target: 0.9 },
    manganese: { min: isMale ? 2.3 : 1.8, max: "-", target: isMale ? 2.3 : 1.8 },
    selenium: { min: 55, max: "-", target: 55 },
    iodine: { min: 150, max: "-", target: 150 },
    water: { min: isMale ? 3700 : 2700, max: "-", target: isMale ? 3700 : 2700 },
    glycemicLoad: { min: "-", max: 100, target: 80 },
  };
};

const getScaledNutrientVal = (log, nutrientKey) => {
  if (log[nutrientKey] !== undefined && typeof log[nutrientKey] === "number") {
    return Number(log[nutrientKey].toFixed(2));
  }
  const food = log.foodId || {};
  const rawVal = food[nutrientKey];
  if (rawVal === undefined || rawVal === null || rawVal === "N/A") {
    return 0;
  }
  const numVal = parseFloat(rawVal) || 0;
  const baseServingSize = food.servingSize || log.servingSize || 100;
  const currentServingSize = log.servingSize || 100;
  const servings = log.servings || 1;
  const scaleFactor = (servings * currentServingSize) / baseServingSize;
  return Number((numVal * scaleFactor).toFixed(2));
};

export const exportHealthReportDataToEmail = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userEmail = req.user.email;
  const username = req.user.username;
  const { startDate, endDate } = req.body || {};

  if (!userEmail) {
    throw new ApiError(400, "No registered email address found for user");
  }

  logger.info(`Starting Health Report Export for user '${username}' (${userEmail}) [${startDate || "All"} to ${endDate || "All"}]`);

  const query = { userId };
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    query.date = { $gte: startDate };
  } else if (endDate) {
    query.date = { $lte: endDate };
  }

  const logs = await FoodLog.find(query).populate("foodId").sort({ date: 1, mealType: 1 });

  if (!logs || logs.length === 0) {
    throw new ApiError(404, "No logged food records found for the selected date range to generate a Health Report.");
  }

  const habitSettingsDoc = await HabitSettings.findOne({ userId });
  const targets = getPrescribedTargets(habitSettingsDoc);

  // Group logs by date
  const logsByDate = {};
  logs.forEach((log) => {
    const d = log.date || "Unknown";
    if (!logsByDate[d]) logsByDate[d] = [];
    logsByDate[d].push(log);
  });

  const uniqueDays = Object.keys(logsByDate).length || 1;

  // --- SHEET 1: Macronutrients Overview ---
  const macroKeys = [
    { key: "calories", label: "Calories", unit: "kcal" },
    { key: "protein", label: "Protein", unit: "g" },
    { key: "carbohydrates", label: "Carbohydrates", unit: "g" },
    { key: "netCarbs", label: "Net Carbs", unit: "g" },
    { key: "fat", label: "Total Fat", unit: "g" },
    { key: "fiber", label: "Fiber", unit: "g" },
    { key: "sugar", label: "Sugar", unit: "g" },
    { key: "addedSugar", label: "Added Sugar", unit: "g" },
  ];

  const sheet1Rows = macroKeys.map((m) => {
    const dailyTotals = Object.values(logsByDate).map((dayLogs) =>
      dayLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, m.key), 0)
    );
    const total = dailyTotals.reduce((a, b) => a + b, 0);
    const avg = total / uniqueDays;
    const tgt = targets[m.key] || { min: "-", max: "-", target: 0 };
    const pct = tgt.target && typeof tgt.target === "number" ? `${Math.round((avg / tgt.target) * 100)}%` : "-";

    let status = "Balanced";
    if (typeof tgt.min === "number" && avg < tgt.min) status = "Below Target";
    else if (typeof tgt.max === "number" && avg > tgt.max) status = "Above Target";
    else if (typeof tgt.target === "number" && avg >= tgt.min) status = "Optimal";

    return {
      Macronutrient: m.label,
      Unit: m.unit,
      "Daily Average": Number(avg.toFixed(2)),
      "Recommended Target": tgt.target || tgt.min || "-",
      "Min Range": tgt.min,
      "Max Range": tgt.max,
      "Goal Fulfillment": pct,
      Status: status,
      "Total Period Intake": Number(total.toFixed(2)),
    };
  });

  // --- SHEET 2: Micronutrients (Vitamins) ---
  const sheet2Rows = VITAMINS.map((v) => {
    const dailyTotals = Object.values(logsByDate).map((dayLogs) =>
      dayLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, v.key), 0)
    );
    const total = dailyTotals.reduce((a, b) => a + b, 0);
    const avg = total / uniqueDays;
    const tgt = targets[v.key] || { min: "-", max: "-", target: 0 };
    const pct = tgt.target && typeof tgt.target === "number" ? `${Math.round((avg / tgt.target) * 100)}%` : "-";
    const status = typeof tgt.min === "number" ? (avg >= tgt.min ? "Met RDA" : "Deficient") : "Adequate";

    return {
      Vitamin: v.label,
      Unit: v.unit,
      "Daily Average": Number(avg.toFixed(2)),
      "RDA Target": tgt.target || tgt.min || "-",
      "% RDA Met": pct,
      Status: status,
      "Total Intake": Number(total.toFixed(2)),
    };
  });

  // --- SHEET 3: Minerals & Electrolytes ---
  const sheet3Rows = MINERALS.map((min) => {
    const dailyTotals = Object.values(logsByDate).map((dayLogs) =>
      dayLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, min.key), 0)
    );
    const total = dailyTotals.reduce((a, b) => a + b, 0);
    const avg = total / uniqueDays;
    const tgt = targets[min.key] || { min: "-", max: "-", target: 0 };
    const pct = tgt.target && typeof tgt.target === "number" ? `${Math.round((avg / tgt.target) * 100)}%` : "-";
    const status = typeof tgt.min === "number" ? (avg >= tgt.min ? "Met RDA" : "Low Intake") : "Normal";

    return {
      Mineral: min.label,
      Unit: min.unit,
      "Daily Average": Number(avg.toFixed(2)),
      "RDA Target": tgt.target || tgt.min || "-",
      "% RDA Met": pct,
      Status: status,
      "Total Intake": Number(total.toFixed(2)),
    };
  });

  // --- SHEET 4: Fatty Acids & Other Biomarkers ---
  const sheet4Rows = FATTY_ACIDS_OTHER.map((fa) => {
    const dailyTotals = Object.values(logsByDate).map((dayLogs) =>
      dayLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, fa.key), 0)
    );
    const total = dailyTotals.reduce((a, b) => a + b, 0);
    const avg = total / uniqueDays;
    const tgt = targets[fa.key] || { min: "-", max: "-", target: 0 };

    return {
      Metric: fa.label,
      Unit: fa.unit || "-",
      "Daily Average": Number(avg.toFixed(2)),
      "Target Limit / Goal": tgt.max !== "-" ? `Max ${tgt.max}` : (tgt.min !== "-" ? `Min ${tgt.min}` : "-"),
      "Total Intake": Number(total.toFixed(2)),
    };
  });

  // --- SHEET 5: Day-by-Day Timeline ---
  const sheet5Rows = Object.keys(logsByDate).sort().map((dateStr) => {
    const dayLogs = logsByDate[dateStr];
    const cals = dayLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, "calories"), 0);
    const prot = dayLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, "protein"), 0);
    const carb = dayLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, "carbohydrates"), 0);
    const fat = dayLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, "fat"), 0);
    const fiber = dayLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, "fiber"), 0);

    return {
      Date: dateStr,
      "Logged Items": dayLogs.length,
      "Total Calories (kcal)": Number(cals.toFixed(2)),
      "Protein (g)": Number(prot.toFixed(2)),
      "Carbohydrates (g)": Number(carb.toFixed(2)),
      "Fat (g)": Number(fat.toFixed(2)),
      "Fiber (g)": Number(fiber.toFixed(2)),
    };
  });

  // Build Excel Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sheet1Rows), "Macros Overview");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sheet2Rows), "Vitamins Analysis");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sheet3Rows), "Minerals & Electrolytes");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sheet4Rows), "Fatty Acids & Metrics");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sheet5Rows), "Daily Log Timeline");

  const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

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
    subject: `🔬 Progress Pulse - Health & Nutrition Report (Macros & Micros) ${rangeTitle}`.trim(),
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #121212; color: #ffffff; padding: 20px;">
        <div style="max-width: 640px; margin: auto; background-color: #1e1e1e; padding: 30px; border-radius: 12px; box-shadow: 0 0 12px rgba(0,0,0,0.5);">
          <h2 style="color: #38bdf8; text-align: center; margin-bottom: 8px;">Health & Nutrition Report</h2>
          <p style="text-align: center; font-size: 13px; color: #94a3b8; margin-top: 0;">Macronutrient & Micronutrient Biomarker Analysis</p>
          <p style="font-size: 16px; color: #cccccc; margin-top: 20px;">Hi <strong>${username}</strong>,</p>
          <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">
            Your requested Health & Nutrition Report for <strong>${startDate || "Earliest Entry"}</strong> to <strong>${endDate || "Latest Entry"}</strong> (${uniqueDays} tracked days) has been generated and is attached below.
          </p>
          <div style="background-color: #0f172a; border-left: 4px solid #38bdf8; padding: 14px 16px; margin: 20px 0; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; color: #f8fafc; font-size: 14px;">Included Worksheets:</h4>
            <ul style="color: #38bdf8; line-height: 1.8; font-size: 14px; margin: 0; padding-left: 20px;">
              <li><strong>Sheet 1: Macros Overview</strong> - Daily average intake, personal goals, and goal fulfillment.</li>
              <li><strong>Sheet 2: Vitamins Analysis</strong> - 13 vitamins tracked with RDA comparison and status.</li>
              <li><strong>Sheet 3: Minerals & Electrolytes</strong> - Calcium, Iron, Potassium, Zinc, Sodium, and more.</li>
              <li><strong>Sheet 4: Fatty Acids & Metrics</strong> - Saturated/unsaturated fats, Omega 3/6, and glycemic data.</li>
              <li><strong>Sheet 5: Daily Log Timeline</strong> - Day-by-day aggregated nutritional totals.</li>
            </ul>
          </div>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 25px;">
            If you did not request this report, please review your account activity.
          </p>
          <hr style="margin: 30px 0; border-color: #334155;" />
          <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
            &copy; ${new Date().getFullYear()} Progress Pulse. All rights reserved.
          </p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Health_Nutrition_Report_${dateRangeStr}.xlsx`,
        content: excelBuffer,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Health Report email sent successfully to '${userEmail}'`);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, `Health & Nutrition Report sent successfully to ${userEmail}`));
  } catch (error) {
    logger.error(`Failed to send Health Report email to '${userEmail}': ${error.message}`);
    throw new ApiError(500, `Failed to send Health Report email: ${error.message}`);
  }
});
