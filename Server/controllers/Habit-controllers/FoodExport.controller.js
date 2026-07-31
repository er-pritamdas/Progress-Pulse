import asyncHandler from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import FoodLog from "../../models/Habit-models/foodLog.model.js";
import HabitSettings from "../../models/Habit-models/habitSettings.model.js";
import nodemailer from "nodemailer";
import XLSX from "xlsx";
import logger from "../../utils/Logging.js";

const DB_NUTRIENTS = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbohydrates", label: "Carbohydrates", unit: "g" },
  { key: "netCarbs", label: "Net Carbs", unit: "g" },
  { key: "fat", label: "Total Fat", unit: "g" },
  { key: "fiber", label: "Fiber", unit: "g" },
  { key: "sugar", label: "Sugar", unit: "g" },
  { key: "addedSugar", label: "Added Sugar", unit: "g" },
  { key: "saturatedFat", label: "Saturated Fat", unit: "g" },
  { key: "monounsaturatedFat", label: "Monounsaturated Fat", unit: "g" },
  { key: "polyunsaturatedFat", label: "Polyunsaturated Fat", unit: "g" },
  { key: "transFat", label: "Trans Fat", unit: "g" },
  { key: "omega3", label: "Omega-3 Fatty Acids", unit: "g" },
  { key: "omega6", label: "Omega-6 Fatty Acids", unit: "g" },
  { key: "cholesterol", label: "Cholesterol", unit: "mg" },
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
  { key: "iron", label: "Iron", unit: "mg" },
  { key: "zinc", label: "Zinc", unit: "mg" },
  { key: "copper", label: "Copper", unit: "mg" },
  { key: "manganese", label: "Manganese", unit: "mg" },
  { key: "selenium", label: "Selenium", unit: "mcg" },
  { key: "iodine", label: "Iodine", unit: "mcg" },
  { key: "water", label: "Water Content", unit: "g" },
  { key: "glycemicIndex", label: "Glycemic Index", unit: "" },
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

  const waterMin = userSettings?.settings?.water?.min ? userSettings.settings.water.min * 1000 : (isMale ? 3700 : 2700);
  const waterMax = userSettings?.settings?.water?.max ? userSettings.settings.water.max * 1000 : "-";

  return {
    calories: { min: calorieMin, max: calorieMax },
    protein: { min: proteinMin, max: proteinMax },
    carbohydrates: { min: carbsMin, max: carbsMax },
    netCarbs: { min: carbsMin, max: carbsMax },
    fat: { min: fatMin, max: fatMax },
    fiber: { min: isMale ? 38 : 25, max: "-" },
    sugar: { min: "-", max: isMale ? 36 : 25 },
    addedSugar: { min: "-", max: isMale ? 36 : 25 },
    saturatedFat: { min: "-", max: 20 },
    monounsaturatedFat: { min: "-", max: 25 },
    polyunsaturatedFat: { min: "-", max: 20 },
    transFat: { min: "-", max: 0 },
    omega3: { min: isMale ? 1.6 : 1.1, max: "-" },
    omega6: { min: isMale ? 17 : 12, max: "-" },
    cholesterol: { min: "-", max: 300 },
    vitaminA: { min: isMale ? 900 : 700, max: "-" },
    vitaminB1: { min: isMale ? 1.2 : 1.1, max: "-" },
    vitaminB2: { min: isMale ? 1.3 : 1.1, max: "-" },
    vitaminB3: { min: isMale ? 16 : 14, max: "-" },
    vitaminB5: { min: 5, max: "-" },
    vitaminB6: { min: age > 50 ? (isMale ? 1.7 : 1.5) : 1.3, max: "-" },
    vitaminB7: { min: 30, max: "-" },
    vitaminB9: { min: 400, max: "-" },
    vitaminB12: { min: 2.4, max: "-" },
    vitaminC: { min: isMale ? 90 : 75, max: "-" },
    vitaminD: { min: 600, max: "-" },
    vitaminE: { min: 15, max: "-" },
    vitaminK: { min: isMale ? 120 : 90, max: "-" },
    iron: { min: isMale ? 8 : (age > 50 ? 8 : 18), max: "-" },
    zinc: { min: isMale ? 11 : 8, max: "-" },
    copper: { min: 0.9, max: "-" },
    manganese: { min: isMale ? 2.3 : 1.8, max: "-" },
    selenium: { min: 55, max: "-" },
    iodine: { min: 150, max: "-" },
    water: { min: waterMin, max: waterMax },
    glycemicIndex: { min: "-", max: 55 },
    glycemicLoad: { min: "-", max: 100 },
  };
};

export const exportFoodLoggingDataToEmail = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userEmail = req.user.email;
  const username = req.user.username;
  const { startDate, endDate } = req.body;

  if (!userEmail) {
    throw new ApiError(400, "No registered email address found for user");
  }

  logger.info(`Starting Food Logging Export for user '${username}' (${userEmail}) [${startDate} to ${endDate}]`);

  // Query food logs in date range
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
    throw new ApiError(404, "No food logs found for the selected date range.");
  }

  // --- Helper to extract nutrient value scaled by logged serving size ---
  const getScaledNutrientVal = (log, nutrientKey) => {
    // Check if directly stored on FoodLog
    if (log[nutrientKey] !== undefined && typeof log[nutrientKey] === "number") {
      return Number(log[nutrientKey].toFixed(2));
    }
    // Else extract from populated foodId
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

  // --- SHEET 1: Logged Food ---
  const sheet1Rows = logs.map((log) => {
    const s = log.servings || 1;
    const sz = (log.servingSize || 100) * s;
    const unit = log.unitType || "g";
    const servingStr = `${s} serving(s) (${sz} ${unit})`;

    const rowObj = {
      Date: log.date || "",
      "Meal Category": log.mealType || "",
      "Food Name": log.foodName || "",
      "Logged Serving Size": servingStr,
    };

    // Add all DB nutrients as top columns
    DB_NUTRIENTS.forEach((nut) => {
      const labelWithUnit = nut.unit ? `${nut.label} (${nut.unit})` : nut.label;
      rowObj[labelWithUnit] = getScaledNutrientVal(log, nut.key);
    });

    return rowObj;
  });

  const sheet1 = XLSX.utils.json_to_sheet(sheet1Rows);

  // --- SHEET 2: Nutrition Stats (Avg, Prescribed Min/Max, Total) ---
  const habitSettingsDoc = await HabitSettings.findOne({ userId });
  const prescribedTargets = getPrescribedTargets(habitSettingsDoc);

  // Group logs by date to compute daily sums
  const logsByDate = {};
  logs.forEach((log) => {
    if (!logsByDate[log.date]) {
      logsByDate[log.date] = [];
    }
    logsByDate[log.date].push(log);
  });

  const uniqueDatesCount = Object.keys(logsByDate).length || 1;

  const statsRows = DB_NUTRIENTS.map((nut) => {
    const dailyTotals = Object.values(logsByDate).map((dayLogs) =>
      dayLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, nut.key), 0)
    );

    const total = dailyTotals.reduce((a, b) => a + b, 0);
    const avg = total / uniqueDatesCount;
    const target = prescribedTargets[nut.key] || { min: "-", max: "-" };

    return {
      Nutrient: nut.label,
      Unit: nut.unit || "-",
      "Average Daily Intake": Number(avg.toFixed(2)),
      "Prescribed Minimum Target": target.min,
      "Prescribed Maximum Target": target.max,
      "Total Intake": Number(total.toFixed(2)),
    };
  });

  const sheet2 = XLSX.utils.json_to_sheet(statsRows);

  // --- SHEET 3: Meal Category Summary ---
  const mealCategories = ["Breakfast", "Lunch", "Dinner", "Snacks", "Other"];
  const categoryStats = mealCategories.map((cat) => {
    const catLogs = logs.filter((l) => l.mealType === cat);
    const count = catLogs.length;
    const calories = catLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, "calories"), 0);
    const protein = catLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, "protein"), 0);
    const carbs = catLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, "carbohydrates"), 0);
    const fat = catLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, "fat"), 0);
    const fiber = catLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, "fiber"), 0);
    const sugar = catLogs.reduce((acc, l) => acc + getScaledNutrientVal(l, "sugar"), 0);

    return {
      "Meal Category": cat,
      "Logged Items Count": count,
      "Total Calories (kcal)": Number(calories.toFixed(2)),
      "Total Protein (g)": Number(protein.toFixed(2)),
      "Total Carbs (g)": Number(carbs.toFixed(2)),
      "Total Fat (g)": Number(fat.toFixed(2)),
      "Total Fiber (g)": Number(fiber.toFixed(2)),
      "Total Sugar (g)": Number(sugar.toFixed(2)),
    };
  });

  // Grand Total Row
  const totalCount = logs.length;
  const totalCalories = logs.reduce((acc, l) => acc + getScaledNutrientVal(l, "calories"), 0);
  const totalProtein = logs.reduce((acc, l) => acc + getScaledNutrientVal(l, "protein"), 0);
  const totalCarbs = logs.reduce((acc, l) => acc + getScaledNutrientVal(l, "carbohydrates"), 0);
  const totalFat = logs.reduce((acc, l) => acc + getScaledNutrientVal(l, "fat"), 0);
  const totalFiber = logs.reduce((acc, l) => acc + getScaledNutrientVal(l, "fiber"), 0);
  const totalSugar = logs.reduce((acc, l) => acc + getScaledNutrientVal(l, "sugar"), 0);

  categoryStats.push({
    "Meal Category": "TOTAL SUMMARY",
    "Logged Items Count": totalCount,
    "Total Calories (kcal)": Number(totalCalories.toFixed(2)),
    "Total Protein (g)": Number(totalProtein.toFixed(2)),
    "Total Carbs (g)": Number(totalCarbs.toFixed(2)),
    "Total Fat (g)": Number(totalFat.toFixed(2)),
    "Total Fiber (g)": Number(totalFiber.toFixed(2)),
    "Total Sugar (g)": Number(totalSugar.toFixed(2)),
  });

  const sheet3 = XLSX.utils.json_to_sheet(categoryStats);

  // Build Excel Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet1, "Logged Food");
  XLSX.utils.book_append_sheet(workbook, sheet2, "Nutrition Stats");
  XLSX.utils.book_append_sheet(workbook, sheet3, "Meal Category Summary");

  const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  // Setup Nodemailer Transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const dateRangeStr = startDate && endDate ? `${startDate}_to_${endDate}` : new Date().toISOString().split("T")[0];
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `🥗 Progress Pulse - Exported Food Logging Data (${startDate || "Start"} to ${endDate || "End"})`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #121212; color: #ffffff; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #1e1e1e; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
          <h2 style="color: #00DFA2; text-align: center;">Food Logging Export</h2>
          <p style="font-size: 16px; color: #cccccc;">Hi <strong>${username}</strong>,</p>
          <p style="font-size: 16px; color: #cccccc;">Your requested Food Logging export for <strong>${startDate}</strong> to <strong>${endDate}</strong> is attached below. The file contains 3 separate sheets:</p>
          <ul style="color: #00DFA2; line-height: 1.8; font-size: 15px;">
            <li><strong>Sheet 1: Logged Food</strong> - All logged food entries scaled to your serving sizes, listing every database nutrient.</li>
            <li><strong>Sheet 2: Nutrition Stats</strong> - Average, Minimum, Maximum, and Total daily intake statistics across the date range.</li>
            <li><strong>Sheet 3: Meal Category Summary</strong> - Category breakdown (Breakfast, Lunch, Dinner, Snacks, Other) with item counts and macro summations.</li>
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
        filename: `Food_Logging_Export_${dateRangeStr}.xlsx`,
        content: excelBuffer,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Food Logging export email sent successfully to '${userEmail}'`);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, `Food Logging export email sent successfully to ${userEmail}`));
  } catch (error) {
    logger.error(`Failed to send Food Logging export email to '${userEmail}': ${error.message}`);
    throw new ApiError(500, `Failed to send Food Logging export email: ${error.message}`);
  }
});
